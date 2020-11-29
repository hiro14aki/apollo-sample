import { gql } from '@apollo/client'

export const ADD_BOOK = gql`
  mutation AddBookQuery($input: InputBook) {
    addBook(input: $input)
  }
`

export const DELETE_BOOK = gql`
  mutation DeleteBookQuery($id: String!) {
    deleteBook(id: $id)
  }
`

export const UPDATE_BOOK = gql`
  mutation UpdateBookQuery($input: UpdateBookTarget) {
    updateBook(input: $input)
  }
`
