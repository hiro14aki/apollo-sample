import { gql } from '@apollo/client'

export const ADD_BOOK = gql`
  mutation AddBookQuery($input: InputBook) {
    addBook(input: $input) {
      id
      title
      author
    }
  }
`

export const DELETE_BOOK = gql`
  mutation DeleteBookQuery($id: String!) {
    deleteBook(id: $id) {
      result
    }
  }
`

export const UPDATE_BOOK = gql`
  mutation UpdateBookQuery($input: UpdateBookTarget) {
    updateBook(input: $input) {
      result
    }
  }
`
