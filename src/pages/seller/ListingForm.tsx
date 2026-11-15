import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";
import { ArrowLeft, ImagePlus, Plus } from "lucide-react";
import { Link, Navigate, useNavigate, useParams } from "react-router";

import PageHeader from "@/components/seller/PageHeader";
import { useListings } from "@/context/useListings";
import {
  listingCategories,
  marketConditions,
  type MarketCondition,
} from "@/data/seller";
import { api, ApiError } from "@/lib/api";

const MAX_PHOTOS = 8;

const inputClass =
  "h-11 w-full rounded-lg border border-[#DDE3DC] bg-white px-3.5 text-[14px] text-black outline-none transition placeholder:text-[#A6ACA5] focus:border-black focus:ring-2 focus:ring-black/5";

const labelClass = "mb-2 block text-[12px] font-medium text-[#4A4A4A]";

type Photo = {
  key: string;
  url: string;
  file?: File;
  existingId?: number;
};

export default function ListingForm() {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const { createListing, updateListing, refresh } = useListings();

  const isEdit = Boolean(listingId);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(listingCategories[0]);
  const [condition, setCondition] = useState<MarketCondition>("Used");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"Active" | "Sold" | "Draft">("Active");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);
  const [activePhoto, setActivePhoto] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceIndexRef = useRef<number | null>(null);
  const objectUrlsRef = useRef<string[]>([]);

  const fileToPhoto = (file: File): Photo => {
    const url = URL.createObjectURL(file);

    objectUrlsRef.current.push(url);

    return {
      key: `new-${file.name}-${file.lastModified}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      url,
      file,
    };
  };

  useEffect(() => {
    if (!listingId) return;

    let active = true;

    async function loadListing() {
      setLoading(true);

      try {
        const listing = await api.listings.get(listingId!);

        if (!active) return;

        setTitle(listing.name);
        setCategory(listing.category);
        setCondition(listing.condition as MarketCondition);
        setPrice(String(listing.price));
        setLocation(listing.location ?? "");
        setDescription(listing.description ?? "");
        setStatus(listing.status);
        setPhotos(
          (listing.imageItems ?? []).map((image) => ({
            key: `existing-${image.id}`,
            url: image.url,
            existingId: image.id,
          })),
        );
      } catch (caught) {
        if (!active) return;

        if (caught instanceof ApiError && caught.status === 404) {
          setNotFound(true);
        } else {
          setError(
            caught instanceof ApiError
              ? caught.message
              : "Could not load this listing.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadListing();

    return () => {
      active = false;
    };
  }, [listingId]);

  // Release preview URLs when the form goes away.
  useEffect(() => {
    const urls = objectUrlsRef.current;

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  if (isEdit && notFound) {
    return <Navigate to="/seller/listings" replace />;
  }

  const addPhotos = (files: FileList | File[]) => {
    const remaining = MAX_PHOTOS - photos.length;

    if (remaining <= 0) return;

    const selected = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, remaining);

    if (selected.length === 0) return;

    const nextPhotos = selected.map(fileToPhoto);

    setPhotos((previous) => [...previous, ...nextPhotos]);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (!files || files.length === 0) return;

    const replaceIndex = replaceIndexRef.current;

    if (replaceIndex !== null) {
      const file = files[0];

      if (file.type.startsWith("image/")) {
        const target = photos[replaceIndex];

        if (target?.existingId !== undefined) {
          setRemovedImageIds((ids) =>
            ids.includes(target.existingId!)
              ? ids
              : [...ids, target.existingId!],
          );
        } else if (target?.file) {
          URL.revokeObjectURL(target.url);
        }

        const replacement = fileToPhoto(file);

        setPhotos((previous) =>
          previous.map((photo, index) =>
            index === replaceIndex ? replacement : photo,
          ),
        );
      }
    } else {
      addPhotos(files);
    }

    replaceIndexRef.current = null;
    event.target.value = "";
  };

  const openPicker = (replaceIndex: number | null = null) => {
    replaceIndexRef.current = replaceIndex;
    fileInputRef.current?.click();
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);

    if (event.dataTransfer.files.length > 0) {
      addPhotos(event.dataTransfer.files);
    }
  };

  const removePhoto = (index: number) => {
    const target = photos[index];

    if (target?.existingId !== undefined) {
      setRemovedImageIds((ids) =>
        ids.includes(target.existingId!)
          ? ids
          : [...ids, target.existingId!],
      );
    }

    if (target?.file) URL.revokeObjectURL(target.url);

    setPhotos((previous) =>
      previous.filter((_, photoIndex) => photoIndex !== index),
    );

    setActivePhoto(0);
  };

  const saveListing = async (nextStatus: "Active" | "Sold" | "Draft") => {
    if (!title.trim()) {
      setError("Give your listing a title before saving.");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      name: title.trim(),
      category,
      condition,
      price: Number(price) || 0,
      location: location.trim(),
      description: description.trim(),
      status: nextStatus,
      images: photos
        .filter((photo): photo is Photo & { file: File } => Boolean(photo.file))
        .map((photo) => photo.file),
      removedImageIds,
    };

    try {
      if (isEdit && listingId) {
        await updateListing(listingId, payload);
      } else {
        await createListing(payload);
      }

      await refresh();
      navigate("/seller/listings");
    } catch (caught) {
      if (caught instanceof ApiError) {
        setError(
          caught.fieldError("name") ??
            caught.fieldError("price") ??
            caught.fieldError("images.0") ??
            caught.message,
        );
      } else {
        setError("Could not save your listing. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void saveListing(status);
  };

  const coverPhoto = photos[0]?.url;

  if (loading) {
    return (
      <p className="py-16 text-center text-[13px] text-[#929792]">
        Loading listing…
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/seller/listings"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#6B726B] transition hover:text-black"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Back to My Listing
      </Link>

      <PageHeader
        eyebrow="YOUR ITEMS, YOUR NEXT CHAPTER"
        title={isEdit ? "Edit listing" : "Create listing"}
        description={
          isEdit
            ? "Update your photos and listing details."
            : "A good photo and a few details are all it takes to get started."
        }
      />

      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-[#F3D3CE] bg-[#FDF2F1] px-4 py-3 text-[13px] text-[#B42318]"
        >
          {error}
        </p>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-start"
      >
        <div className="space-y-6">
          {/* Photos */}
          <section className="rounded-[10px] border border-[#E8ECE7] bg-white p-5 sm:p-6">
            <h2 className="text-[15px] font-semibold text-black">Photos</h2>
            <p className="mt-1 text-[12px] leading-relaxed text-[#929792]">
              Add up to 8 photos. Your first photo is the cover.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="sr-only"
              aria-label="Choose listing photos"
            />

            {photos.length === 0 ? (
              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={`mt-4 flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-10 text-center transition ${
                  dragging
                    ? "border-black bg-[#F4F7F1]"
                    : "border-[#DDE3DC] bg-[#FBFCFA]"
                }`}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E9F0E4] text-black">
                  <ImagePlus size={20} aria-hidden="true" />
                </span>

                <p className="mt-3 text-[13px] font-medium text-black">
                  Drag photos here, or choose files
                </p>

                <button
                  type="button"
                  onClick={() => openPicker()}
                  className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-md bg-black px-3.5 text-[12px] font-medium text-white transition hover:bg-[#292929]"
                >
                  <Plus size={13} aria-hidden="true" />
                  Choose photos
                </button>

                <p className="mt-2 text-[12px] text-[#929792]">
                  JPG, PNG, or WEBP
                </p>
              </div>
            ) : (
              <div className="mt-4 flex flex-wrap items-start gap-4">
                <div className="w-[124px] shrink-0">
                  <div className="h-[124px] w-[124px] overflow-hidden rounded-lg border border-[#E8ECE7] bg-[#F4F7F1]">
                    <img
                      src={photos[activePhoto]?.url ?? coverPhoto}
                      alt={title || "Listing photo"}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => openPicker(activePhoto)}
                    className="mt-2 block text-[12px] font-medium text-black hover:underline"
                  >
                    Replace photo
                  </button>

                  <button
                    type="button"
                    onClick={() => removePhoto(activePhoto)}
                    className="mt-1 block text-[12px] font-medium text-[#B42318] hover:underline"
                  >
                    Remove photo
                  </button>
                </div>

                <div className="flex min-w-0 flex-1 flex-wrap gap-2">
                  {photos.map((photo, index) => (
                    <button
                      key={photo.key}
                      type="button"
                      onClick={() => setActivePhoto(index)}
                      aria-label={`Photo ${index + 1}`}
                      className={`relative h-16 w-16 overflow-hidden rounded-md border transition ${
                        activePhoto === index
                          ? "border-black ring-1 ring-black"
                          : "border-[#E8ECE7] hover:border-black"
                      }`}
                    >
                      <img
                        src={photo.url}
                        alt=""
                        className="h-full w-full object-cover"
                      />

                      {index === 0 ? (
                        <span className="absolute left-1 top-1 rounded bg-white/90 px-1 py-0.5 text-[10px] font-semibold text-black">
                          Cover
                        </span>
                      ) : null}
                    </button>
                  ))}

                  {photos.length < MAX_PHOTOS ? (
                    <button
                      type="button"
                      onClick={() => openPicker()}
                      aria-label="Add photo"
                      className="flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-[#DDE3DC] text-[#6B726B] transition hover:border-black hover:text-black"
                    >
                      <Plus size={16} aria-hidden="true" />
                      <span className="text-[10px] font-medium">Add</span>
                    </button>
                  ) : null}
                </div>
              </div>
            )}
          </section>

          {/* Listing details */}
          <section className="rounded-[10px] border border-[#E8ECE7] bg-white p-5 sm:p-6">
            <h2 className="text-[15px] font-semibold text-black">
              Listing details
            </h2>
            <p className="mt-1 text-[12px] leading-relaxed text-[#929792]">
              Tell your next buyer a little about your item.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="listingTitle" className={labelClass}>
                  Title
                </label>
                <input
                  id="listingTitle"
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="What are you selling?"
                  maxLength={80}
                  required
                  className={inputClass}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="listingCategory" className={labelClass}>
                    Category
                  </label>
                  <select
                    id="listingCategory"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    required
                    className={inputClass}
                  >
                    {listingCategories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="listingCondition" className={labelClass}>
                    Condition
                  </label>
                  <select
                    id="listingCondition"
                    value={condition}
                    onChange={(event) =>
                      setCondition(event.target.value as MarketCondition)
                    }
                    required
                    className={inputClass}
                  >
                    {marketConditions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="listingPrice" className={labelClass}>
                  Price (PHP)
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] text-[#6B726B]">
                    ₱
                  </span>
                  <input
                    id="listingPrice"
                    type="number"
                    min="0"
                    step="1"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    placeholder="Enter price"
                    required
                    className={`${inputClass} pl-8`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="listingLocation" className={labelClass}>
                  Location
                </label>
                <input
                  id="listingLocation"
                  type="text"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Enter your location"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="listingDescription" className={labelClass}>
                  Description
                </label>
                <textarea
                  id="listingDescription"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={4}
                  placeholder="Describe the condition, what's included, and anything your buyer should know."
                  className="w-full resize-none rounded-lg border border-[#DDE3DC] bg-white px-3.5 py-3 text-[14px] leading-relaxed text-black outline-none transition placeholder:text-[#A6ACA5] focus:border-black focus:ring-2 focus:ring-black/5"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Live preview */}
        <aside className="rounded-[10px] border border-[#E8ECE7] bg-white p-5 xl:sticky xl:top-24">
          <h2 className="text-[15px] font-semibold text-black">
            Listing preview
          </h2>
          <p className="mt-1 text-[12px] leading-relaxed text-[#929792]">
            {isEdit
              ? "How your item looks in the market."
              : "Your preview updates as you add details."}
          </p>

          <div className="mt-4 overflow-hidden rounded-lg border border-[#E8ECE7] bg-[#F4F7F1]">
            {coverPhoto ? (
              <img
                src={coverPhoto}
                alt={title || "Listing cover"}
                className="h-[180px] w-full object-cover"
              />
            ) : (
              <div className="flex h-[180px] flex-col items-center justify-center gap-2 px-4 text-center text-[#929792]">
                <ImagePlus size={22} aria-hidden="true" />
                <p className="text-[12px] leading-relaxed">
                  Your cover photo will appear here
                </p>
              </div>
            )}
          </div>

          <p className="mt-3 truncate text-[14px] font-semibold text-black">
            {title.trim() || "Your listing title"}
          </p>
          <p className="mt-1 text-[16px] font-semibold text-black">
            ₱{(Number(price) || 0).toLocaleString()}
          </p>
          <p className="mt-1 text-[12px] text-[#929792]">
            {location.trim() || "Your location"}
          </p>
        </aside>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 border-t border-[#E8ECE7] pt-5 sm:flex-row sm:items-center sm:justify-between xl:col-span-2">
          <button
            type="button"
            onClick={() => navigate("/seller/listings")}
            className="h-11 rounded-lg border border-[#DDE3DC] bg-white px-4 text-[13px] font-medium text-[#4A4A4A] transition hover:border-black hover:text-black"
          >
            Cancel
          </button>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              disabled={saving}
              onClick={() => void saveListing("Draft")}
              className="h-11 rounded-lg border border-[#DDE3DC] bg-white px-4 text-[13px] font-medium text-black transition hover:border-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              Save as draft
            </button>

            <button
              type="submit"
              disabled={saving}
              className="h-11 rounded-lg bg-black px-5 text-[13px] font-medium text-white transition hover:bg-[#292929] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving…"
                : isEdit
                  ? "Save changes"
                  : "Publish listing"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
