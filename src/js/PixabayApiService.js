import axios from 'axios';

const API_KEY = '25272385-d3b781fb1902e693cd197cf56';
const BASE_URL = 'https://pixabay.com/api/';
const DEFAULT_QUERY = '&per_page=40&image_type=photo&orientation=horizontal&safesearch=true';

export default class PixabayApiService {
  constructor() {
    this.page = 1;
    this.searchQuery = '';
  }
  getArticles() {
    const url = `${BASE_URL}?key=${API_KEY}&q=${this.searchQuery}&page=${this.page}${DEFAULT_QUERY}`;
    return axios.get(url).then(response => {
      this.incrementPage();
      return response;
    });
  }
  incrementPage() {
    this.page += 1;
  }
  resetPage() {
    this.page = 1;
  }
  get query() {
    return this.searchQuery;
  }

  set query(newQuery) {
    this.searchQuery = newQuery;
  }
}
