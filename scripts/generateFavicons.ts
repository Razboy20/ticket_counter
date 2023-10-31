import favicons from "favicons";
import fs from "fs/promises";
import path from "path";

const src = path.resolve(__dirname, "../src/assets/img/logo.svg");
const dest = path.resolve(__dirname, "../src/assets/favicon/");

favicons(src, {
  path: dest,
  icons: {
    android: false,
    appleIcon: false,
    appleStartup: false,
    favicons: true,
    windows: false,
    yandex: false,
  },
}).then(async (response) => {
  await fs.mkdir(dest, { recursive: true });
  await Promise.all(
    response.images.map(async (image) => await fs.writeFile(path.join(dest, image.name), image.contents)),
  );
  await Promise.all(response.files.map(async (file) => await fs.writeFile(path.join(dest, file.name), file.contents)));

  console.log(response.html.join("\n"));
});
