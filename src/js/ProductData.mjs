function convertToJson(res) {
  if (res.ok) {
    return res.json();
  } else {
    throw new Error('Bad Response');
  }
}

function fixImagePaths(data) {
  return data.map(item => {
    // Fix local ../images/ paths to /images/
    if (item.Image) {
      item.Image = item.Image.replace(/^\.\.\/images\//, '/images/');
    }
    // Fix Colors ColorImg
    if (item.Colors && Array.isArray(item.Colors)) {
      item.Colors = item.Colors.map(c => ({
        ...c,
        ColorImg: c.ColorImg
          ? c.ColorImg.replace(/^\.\.\/images\//, '/images/')
          : c.ColorImg
      }));
    }
    return item;
  });
}

export default class ProductData {
  constructor(category) {
    this.category = category;
    this.path = `/json/${this.category}.json`;
  }

  async getData() {
    return fetch(this.path)
      .then(convertToJson)
      .then((data) => {
        const list = data.Result || data;
        return fixImagePaths(list);
      });
  }

  async findProductById(id) {
    const products = await this.getData();
    return products.find((item) => item.Id === id);
  }
}