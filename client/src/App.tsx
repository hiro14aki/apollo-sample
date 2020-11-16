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
  const intervalId = React.useRef<number>()

  const debounce = (func: () => void, delay: number) => {
    clearTimeout(intervalId.current)
    intervalId.current = window.setTimeout(func, delay)
  }

  const FETCH_BOOK_LIST = gql`
    query MyQuery($text: String!) {
      books(author: $text) {
        title
        author
      }
    }
  `

  const fetchList = useCallback((text: string = '') => {
    client
      .query({
        query: FETCH_BOOK_LIST,
        variables: { text },
      })
      .then((result) => {
        setBookList(result.data.books)
      })
  }, [FETCH_BOOK_LIST])

  const searchBook = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setSearchText(event.target.value)
      debounce(() => fetchList(event.target.value), 500)
    },
    [fetchList]
  )

  // For initial rendering.
  useEffect(() => {
    fetchList()
  }, [fetchList])

  return (
    <div className="root">
      <h1>Book list</h1>
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
              <th className={'title'} style={{ width: '10%' }}>
                No.
              </th>
              <th className={'title'} style={{ width: '45%' }}>
                title
              </th>
              <th className={'title'} style={{ width: '45%' }}>
                Author
              </th>
            </tr>
          </thead>
          <tbody>
            {bookList.map((book, index) => {
              return (
                <tr key={index}>
                  <td className={'data'}>{index + 1}</td>
                  <td className={'data'}>{book.title}</td>
                  <td className={'data'}>{book.author}</td>
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
