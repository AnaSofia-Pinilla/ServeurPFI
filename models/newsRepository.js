const Repository = require("./repository");
const NewsFilesRepository = require("./newsFilesRepository.js");
const News = require("./news.js");
const utilities = require("../utilities");

module.exports = class NewsRepository extends Repository {
  constructor(req) {
    super("News", true);
    this.users = new Repository("Users");
    this.req = req;
    this.setBindExtraDataMethod(this.bindUsernameAndImageURL);
  }
  bindUsernameAndImageURL(image) {
    if (image) {
      let user = this.users.get(image.UserId);
      let username = "unknown";
      if (user !== null) username = user.Name;
      let bindedImage = { ...image };
      bindedImage["Username"] = username;
      bindedImage["Date"] = utilities.secondsToDateString(image["Created"]);
      if (image["GUID"] != "") {
        bindedImage["OriginalURL"] =
          "http://" +
          this.req.headers["host"] +
          NewsFilesRepository.getImageFileURL(image["GUID"]);
        bindedImage["ThumbnailURL"] =
          "http://" +
          this.req.headers["host"] +
          NewsFilesRepository.getThumbnailFileURL(image["GUID"]);
      } else {
        bindedImage["OriginalURL"] = "";
        bindedImage["ThumbnailURL"] = "";
      }
      return bindedImage;
    }
    return null;
  }
  add(news) {
    news["Created"] = utilities.nowInSeconds();
    if (News.valid(news)) {
      news["GUID"] = NewsFilesRepository.storeImageData("", news["ImageData"]);
      delete news["ImageData"];
      return super.add(news);
    }
    return null;
  }
  update(news) {
    news["Created"] = utilities.nowInSeconds();
    if (News.valid(news)) {
      let foundImage = super.get(news.Id);
      if (foundImage != null) {
        news["GUID"] = NewsFilesRepository.storeImageData(
          news["GUID"],
          news["ImageData"]
        );
        delete news["ImageData"];
        return super.update(news);
      }
    }
    return false;
  }
  remove(id) {
    let foundImage = super.get(id);
    if (foundImage) {
      NewsFilesRepository.removeNewsFile(foundImage["GUID"]);
      return super.remove(id);
    }
    return false;
  }
};
