// Default front-end AJAX timeout
import axios from 'axios'
axios.defaults.timeout = 60 * 1000

// API endpoint
export const API_BASE =
  process.env.NODE_ENV === 'development'
    ? 'https://link.hanze.icu'
    : ''

// Copyright links
// Do not modify please
export const GITHUB_OWNER = 'FreeNowOrg'
export const GITHUB_REPO = 'ShortNow'
export const GITHUB_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`

// Site name
export const PROJECT_NAME = 'ShortURL Now'
