# Service Category Icons

Place your service category icon images in this folder.

## Required Images

Add PNG images with these exact filenames:

1. `house-cleaning.png` - House/home cleaning icon
2. `lawn-care.png` - Lawn mower or grass icon
3. `plumbing.png` - Wrench or pipe icon
4. `electrical.png` - Lightning bolt or plug icon
5. `handyman.png` - Hammer or tools icon
6. `pet-grooming.png` - Dog or pet icon
7. `moving.png` - Moving truck or box icon
8. `hvac.png` - AC unit or thermostat icon
9. `painting.png` - Paint brush or roller icon
10. `carpet-cleaning.png` - Vacuum or carpet icon

## Image Specifications

- **Format:** PNG (preferred) or JPG
- **Size:** 200x200 pixels minimum, 512x512 pixels recommended
- **Background:** Transparent (for PNG) or white
- **File Size:** Keep under 100KB per image
- **Style:** Consistent style across all icons (line art, flat design, or realistic)

## Free Icon Resources

You can find free service icons from:
- [Flaticon](https://www.flaticon.com/) - Search for each service type
- [Icons8](https://icons8.com/) - Free icons with attribution
- [The Noun Project](https://thenounproject.com/) - Simple line icons
- [Freepik](https://www.freepik.com/) - Free vectors and icons

## After Adding Images

Once you've added your images to this folder, run the update script:

```bash
cd backend
npm run build
node dist/scripts/updateServiceIcons.js
```

This will update the database to use your new image paths instead of emoji icons.
