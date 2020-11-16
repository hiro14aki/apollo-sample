import React, { ChangeEvent, useCallback, useEffect, useState } from 'react'
import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
import 'reset-css'
import './App.css'

type BookList = {
  title: string
  author: string
}[]

const client = new ApolloClient({
  uri: 'http://localhost:4000/',
  cache: new InMemoryCache(),
})

function App() {
  const [bookList, setBookList] = useState<BookList>([
    { title: '', author: '' },
  ])
  const [searchText, setSearchText] = useState<string>('')
  const [title, setTitle] = useState<string>('')
  const [author, setAuthor] = useState<string>('')
  const intervalId = React.useRef<number>()

  const debounce = (func: () => void, delay: number) => {
    clearTimeout(intervalId.current)
    intervalId.current = window.setTimeout(func, delay)
  }

  const FETCH_BOOK_LIST = gql`
    query FetchBookListQuery($text: String!) {
      books(author: $text) {
        title
        author
      }
    }
  `
  const ADD_BOOK = gql`
    mutation AddBookQuery($input: InputBook) {
      addBook(input: $input)
    }
  `
  
  const DELETE_BOOK = gql`
    mutation DeleteBookQuery($title: String!){
      deleteBook(title: $title)
    }
  `

  const fetchList = useCallback(
    // TODO 本来なら更新後のリスト更新だけ no-cache にしたい
    (text: string = '', forceRefresh: boolean = true) => {
      const requestQuery = {
        query: FETCH_BOOK_LIST,
        variables: { text },
      }
      client
        .query(
          forceRefresh
            ? {
                ...requestQuery,
                fetchPolicy: 'no-cache',
              }
            : requestQuery
        )
        .then((result) => {
          setBookList(result.data.books)
        })
    },
    [FETCH_BOOK_LIST]
  )

  const searchBook = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setSearchText(event.target.value)
      debounce(() => fetchList(event.target.value), 500)
    },
    [fetchList]
  )

  const addBook = useCallback(() => {
    client
      .mutate({
        mutation: ADD_BOOK,
        variables: { input: { title, author } },
        fetchPolicy: 'no-cache',
      })
      .then((r) => {
        fetchList(searchText, true)
      })
  }, [title, author, fetchList, searchText, ADD_BOOK])
  
  const deleteBook = useCallback((title: string) => {
    console.log('delete !!')
    console.log(title)
    
    client.mutate({
      mutation: DELETE_BOOK,
      variables: { title },
      fetchPolicy: 'no-cache'
    }).then(result => {
      fetchList(searchText, true)
    })
  }, [fetchList, searchText, DELETE_BOOK])

  // For initial rendering.
  useEffect(() => {
    fetchList()
  }, [fetchList])

  return (
    <div className="root">
      <h1>Book list</h1>
      <div className={'input'}>
        <h2>Add book</h2>
        <div className={'inputArea'}>
          <div className={'inputField'}>
            <p className={'inputField__Title'}>Title</p>
            <input
              type={'text'}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
              }}
            />
          </div>
          <div className={'inputField'}>
            <p className={'inputField__Title'}>Author</p>
            <input
              type={'text'}
              value={author}
              onChange={(e) => {
                setAuthor(e.target.value)
              }}
            />
          </div>
        </div>
        <input
          type={'button'}
          value={'AddBook'}
          onClick={() => {
            addBook()
          }}
        />
      </div>
      <div>
        <h2>Author search</h2>
        <div className={'searchArea'}>
          <input
            type={'text'}
            value={searchText}
            onChange={(e) => searchBook(e)}
          />
        </div>
      </div>
      <div>
        <table className={'listTable'}>
          <thead>
            <tr>
              <th className={'title'} style={{ width: '5%' }}>
                No.
              </th>
              <th className={'title'} style={{ width: '40%' }}>
                title
              </th>
              <th className={'title'} style={{ width: '35%' }}>
                Author
              </th>
              <th className={'title'} style={{ width: '10%' }}>
                Action
              </th>
              <th className={'title'} style={{ width: '10%' }} />
            </tr>
          </thead>
          <tbody>
            {bookList.map((book, index) => {
              return (
                <tr key={index}>
                  <td className={'data'}>{index + 1}</td>
                  <td className={'data'}>{book.title}</td>
                  <td className={'data'}>{book.author}</td>
                  <td>
                    <input type={'button'} value={'Modify'} onClick={() => {}} />
                  </td>
                  <td>
                    <input type={'button'} value={'Delete'} onClick={() => deleteBook(book.title)}/>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default App
