import { useEffect, useState, type FormEvent } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import { useNavigate } from "react-router";

import Modal from "@/components/seller/Modal";
import PageHeader from "@/components/seller/PageHeader";
import { useAuth } from "@/context/useAuth";
import { api, ApiError, clearToken } from "@/lib/api";

type Dialog = "password" | "signout" | "delete" | "discard" | null;

const secondaryButtonClass =
  "h-9 rounded-lg border border-[#DDE3DC] bg-white px-4 text-[12px] font-medium text-[#4A4A4A] transition hover:border-black hover:text-black";

const primaryButtonClass =
  "h-9 rounded-lg bg-black px-4 text-[12px] font-medium text-white transition hover:bg-[#292929] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60";

type PasswordFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  visible: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
};

function PasswordField({
  id,
  label,
  placeholder,
  value,
  visible,
  onToggle,
  onChange,
}: PasswordFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-[12px] font-medium text-black"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-10 w-full rounded-md border border-[#DDE3DC] bg-white pl-3 pr-10 text-[13px] text-black outline-none transition placeholder:text-[#A6ACA5] focus:border-black focus:ring-2 focus:ring-black/5"
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1 text-[#8A9089] transition hover:text-black"
        >
          {visible ? (
            <EyeOff size={14} aria-hidden="true" />
          ) : (
            <Eye size={14} aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const [dialog, setDialog] = useState<Dialog>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("Changes saved");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [visiblePasswords, setVisiblePasswords] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [passwordError, setPasswordError] = useState("");
  const [deletePassword, setDeletePassword] = useState("");

  useEffect(() => {
    if (!toastVisible) return;

    const timer = window.setTimeout(() => setToastVisible(false), 3500);
    return () => window.clearTimeout(timer);
  }, [toastVisible]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    showToast("Changes saved");
  };

  const closeDialog = () => {
    setDialog(null);
    setPasswordError("");
    setDeletePassword("");
  };

  const handleUpdatePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!passwords.current || !passwords.next || !passwords.confirm) {
      setPasswordError("Fill in all password fields.");
      return;
    }

    if (passwords.next.length < 8) {
      setPasswordError("Use at least 8 characters for your new password.");
      return;
    }

    if (passwords.next !== passwords.confirm) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setBusy(true);

    try {
      await api.profile.changePassword({
        current_password: passwords.current,
        password: passwords.next,
        password_confirmation: passwords.confirm,
      });

      setPasswords({ current: "", next: "", confirm: "" });
      setVisiblePasswords({ current: false, next: false, confirm: false });
      setPasswordError("");
      setDialog(null);
      showToast("Password updated");
    } catch (caught) {
      setPasswordError(
        caught instanceof ApiError
          ? (caught.fieldError("current_password") ??
              caught.fieldError("password") ??
              caught.message)
          : "Could not update your password.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    setBusy(true);

    try {
      await signOut();
      navigate("/auth/login", { replace: true });
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setError("Enter your password to delete your account.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      await api.profile.destroy(deletePassword);
      clearToken();
      navigate("/auth/login", { replace: true });
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Could not delete your account.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSave} className="space-y-7">
        <PageHeader
          eyebrow="SETTINGS"
          title="Settings"
          description="Update your account, security, and notification preferences."
          actions={
            <button
              type="submit"
              className="h-10 rounded-lg bg-black px-4 text-[13px] font-medium text-white transition hover:bg-[#292929] active:scale-[0.99]"
            >
              Save changes
            </button>
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

        <div className="grid gap-6 lg:grid-cols-2">

          {/* Account */}
          <section className="h-fit rounded-[10px] border border-[#E8ECE7] bg-white p-6">
            <h2 className="text-[15px] font-semibold text-black">Account</h2>
            <p className="mt-1 text-[13px] text-[#929792]">
              Your sign-in details and account preferences.
            </p>

            <div className="mt-5 border-t border-[#F0F2EE] pt-4">
              <p className="text-[12px] text-[#929792]">Email address</p>
              <p className="mt-1 text-[14px] font-medium text-black">
                {user?.email ?? "—"}
              </p>
            </div>

            <div className="mt-4 border-t border-[#F0F2EE] pt-4">
              <p className="text-[12px] text-[#929792]">Username</p>
              <p className="mt-1 text-[14px] font-medium text-black">
                {user?.username || "—"}
              </p>
            </div>
          </section>

          {/* Account controls */}
          <section className="rounded-[10px] border border-[#E8ECE7] bg-white p-6 lg:row-span-2">
            <h2 className="text-[15px] font-semibold text-black">
              Account controls
            </h2>
            <p className="mt-1 text-[13px] text-[#929792]">
              You're in control of your BALIGYA account.
            </p>

            {/* Sign out */}
            <div className="mt-5 flex items-start justify-between gap-4 border-t border-[#F0F2EE] pt-4">
              <div>
                <p className="text-[14px] font-medium text-black">
                  Taking a break?
                </p>
                <p className="mt-1 text-[12px] text-[#929792]">
                  Sign out on this device.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDialog("signout")}
                className="h-9 shrink-0 rounded-md border border-[#DDE3DC] px-3.5 text-[13px] font-medium text-black transition hover:border-black"
              >
                Sign out
              </button>
            </div>

            {/* Delete account */}
            <div className="mt-5 border-t border-[#F0F2EE] pt-4">
              <p className="text-[14px] font-medium text-black">
                Delete account
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-[#929792]">
                Permanently remove your account, profile, and listings. This
                action cannot be undone.
              </p>

              <button
                type="button"
                onClick={() => setDialog("delete")}
                className="mt-3 text-[13px] font-medium text-[#B42318] hover:underline"
              >
                Delete my account
              </button>
            </div>
          </section>

          {/* Security */}
          <section className="h-fit rounded-[10px] border border-[#E8ECE7] bg-white p-6">
            <h2 className="text-[15px] font-semibold text-black">Security</h2>
            <p className="mt-1 text-[13px] text-[#929792]">
              A few simple steps to keep your account protected.
            </p>

            <div className="mt-5 flex items-start justify-between gap-4 border-t border-[#F0F2EE] pt-4">
              <div>
                <p className="text-[14px] font-medium text-black">Password</p>
                <p className="mt-1 text-[12px] text-[#929792]">
                  Use a strong password you don't reuse.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDialog("password")}
                className="h-9 shrink-0 rounded-md border border-[#DDE3DC] px-3.5 text-[13px] font-medium text-black transition hover:border-black"
              >
                Change password
              </button>
            </div>
          </section>
        </div>

        {/* Footer actions */}
        <div className="flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setDialog("discard")}
            className="h-10 rounded-lg border border-[#DDE3DC] bg-white px-4 text-[13px] font-medium text-[#4A4A4A] transition hover:border-black hover:text-black"
          >
            Discard changes
          </button>
        </div>
      </form>

      {/* Changes saved toast */}
      {toastVisible ? (
        <div
          role="status"
          className="absolute right-0 top-14 z-30 flex w-[190px] origin-top-right animate-[dropdown-in_150ms_ease-out] items-center justify-between gap-3 rounded-lg border border-[#E8ECE7] bg-white px-3.5 py-2.5 shadow-[0_12px_32px_rgba(0,0,0,0.14)] motion-reduce:animate-none"
        >
          <p className="text-[12px] font-medium text-black">{toastMessage}</p>

          <button
            type="button"
            onClick={() => setToastVisible(false)}
            aria-label="Dismiss notification"
            className="rounded p-0.5 text-[#8A9089] transition hover:text-black"
          >
            <X size={13} aria-hidden="true" />
          </button>
        </div>
      ) : null}

      {/* Change password */}
      <Modal
        open={dialog === "password"}
        onClose={closeDialog}
        title="Change password"
        description="Choose a strong password you don't use on other accounts."
        footer={
          <>
            <button
              type="button"
              onClick={closeDialog}
              className={secondaryButtonClass}
            >
              Cancel
            </button>

            <button
              type="submit"
              form="change-password-form"
              disabled={busy}
              className={primaryButtonClass}
            >
              {busy ? "Updating…" : "Update password"}
            </button>
          </>
        }
      >
        <form
          id="change-password-form"
          onSubmit={(event) => void handleUpdatePassword(event)}
          className="space-y-4"
        >
          <PasswordField
            id="current-password"
            label="Current password"
            placeholder="Enter current password"
            value={passwords.current}
            visible={visiblePasswords.current}
            onToggle={() =>
              setVisiblePasswords((previous) => ({
                ...previous,
                current: !previous.current,
              }))
            }
            onChange={(value) =>
              setPasswords((previous) => ({ ...previous, current: value }))
            }
          />

          <div>
            <PasswordField
              id="new-password"
              label="New password"
              placeholder="Enter a new password"
              value={passwords.next}
              visible={visiblePasswords.next}
              onToggle={() =>
                setVisiblePasswords((previous) => ({
                  ...previous,
                  next: !previous.next,
                }))
              }
              onChange={(value) =>
                setPasswords((previous) => ({ ...previous, next: value }))
              }
            />

            <p className="mt-1.5 max-w-[360px] text-[11px] leading-relaxed text-[#929792]">
              Use at least 8 characters, with an uppercase letter, a lowercase
              letter, a number, and a symbol.
            </p>
          </div>

          <PasswordField
            id="confirm-password"
            label="Confirm new password"
            placeholder="Re-enter your new password"
            value={passwords.confirm}
            visible={visiblePasswords.confirm}
            onToggle={() =>
              setVisiblePasswords((previous) => ({
                ...previous,
                confirm: !previous.confirm,
              }))
            }
            onChange={(value) =>
              setPasswords((previous) => ({ ...previous, confirm: value }))
            }
          />

          {passwordError ? (
            <p role="alert" className="text-[12px] text-[#B42318]">
              {passwordError}
            </p>
          ) : null}
        </form>
      </Modal>

      {/* Sign out confirmation */}
      <Modal
        open={dialog === "signout"}
        onClose={closeDialog}
        title="Sign out of BALIGYA?"
        footer={
          <>
            <button
              type="button"
              onClick={closeDialog}
              className={secondaryButtonClass}
            >
              Stay signed in
            </button>

            <button
              type="button"
              onClick={() => void handleSignOut()}
              disabled={busy}
              className={primaryButtonClass}
            >
              {busy ? "Signing out…" : "Sign out"}
            </button>
          </>
        }
      />

      {/* Delete account confirmation */}
      <Modal
        open={dialog === "delete"}
        onClose={closeDialog}
        title="Delete your account?"
        description="This permanently deletes your BALIGYA account. This action cannot be undone."
        footer={
          <>
            <button
              type="button"
              onClick={closeDialog}
              className={secondaryButtonClass}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => void handleDeleteAccount()}
              disabled={busy}
              className="h-9 rounded-lg border border-[#F3D3CE] bg-[#FDF2F1] px-4 text-[12px] font-medium text-[#B42318] transition hover:bg-[#FBE6E3] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "Deleting…" : "Delete my account"}
            </button>
          </>
        }
      >
        <label
          htmlFor="delete-password"
          className="mb-1.5 block text-[12px] font-medium text-black"
        >
          Confirm your password
        </label>

        <input
          id="delete-password"
          type="password"
          value={deletePassword}
          onChange={(event) => setDeletePassword(event.target.value)}
          placeholder="Enter your password"
          className="h-10 w-full rounded-md border border-[#DDE3DC] bg-white px-3 text-[13px] text-black outline-none transition placeholder:text-[#A6ACA5] focus:border-black focus:ring-2 focus:ring-black/5"
        />
      </Modal>

      {/* Discard changes confirmation */}
      <Modal
        open={dialog === "discard"}
        onClose={closeDialog}
        title="Discard your changes?"
        description="You have unsaved changes to your settings. If you discard them, your edits will be lost and your saved preferences will be restored."
        footer={
          <button
            type="button"
            onClick={() => {
              closeDialog();
              showToast("Changes discarded");
            }}
            className="h-9 rounded-lg bg-[#B42318] px-4 text-[12px] font-medium text-white transition hover:bg-[#96190F] active:scale-[0.99]"
          >
            Discard changes
          </button>
        }
      />
    </div>
  );
}
