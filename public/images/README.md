# Real product photos

Drop image files in this folder, then reference them from
`src/data/seller.ts` with a path that starts with `/images/`.

Example:

```ts
// public/images/ua-tshirt.jpg  ->  /images/ua-tshirt.jpg
{
  id: "ua-tshirt",
  name: "UA T-Shirt",
  // ...
  image: "/images/ua-tshirt.jpg",
}
```

- `sellerListings` -> `image` (and optionally `images` for a gallery)
- `marketProducts` -> `image`
- `conversations` -> `productImage`

Photos are rendered with `object-cover`, so square or 4:3 images work best.
Products without an `image` keep their emoji placeholder.
