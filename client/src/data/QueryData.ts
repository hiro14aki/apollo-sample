import { gql } from '@apollo/client'

export const FETCH_BOOK_LIST = gql`
  query FetchBookListQuery($text: String!) {
    books(author: $text) {
      id
      title
      author
    }
  }
`
