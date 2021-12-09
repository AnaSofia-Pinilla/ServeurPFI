const NewsRepository = require("../models/newsRepository");
module.exports = class NewsController extends require("./Controller") {
  constructor(req, res, params) {
    super(req, res, params, false /* needAuthorization */);
    this.NewsRepository = new NewsRepository(req);
  }
  head() {
    this.response.JSON(null, this.NewsRepository.ETag);
  }
  get(id) {
    // if we have no parameter, expose the list of possible query strings
    if (this.params === null) {
      if (!isNaN(id)) {
        this.response.JSON(this.NewsRepository.get(id));
      } else
        this.response.JSON(
          this.NewsRepository.getAll(),
          this.NewsRepository.ETag
        );
    } else {
      if (Object.keys(this.params).length === 0) {
        /* ? only */ this.queryStringHelp();
      } else {
        this.response.JSON(
          this.NewsRepository.getAll(this.params),
          this.NewsRepository.ETag
        );
      }
    }
  }
  post(news) {
    if (this.requestActionAuthorized()) {
      let newNews = this.NewsRepository.add(news);
      if (newNews) this.response.created(newNews);
      else this.response.unprocessable();
    } else this.response.unAuthorized();
  }
  put(news) {
    if (this.requestActionAuthorized()) {
      if (this.NewsRepository.update(news)) this.response.ok();
      else this.response.unprocessable();
    } else this.response.unAuthorized();
  }
  remove(id) {
    if (this.requestActionAuthorized()) {
      if (this.NewsRepository.remove(id)) this.response.accepted();
      else this.response.notFound();
    } else this.response.unAuthorized();
  }
};
