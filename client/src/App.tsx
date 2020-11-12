import React, { useCallback, useEffect, useState } from 'react'
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

  const fetchList = useCallback((text: string = '') => {
    client
      .query({
        query: gql`
          query MyQuery($text: String!) {
            books(author: $text) {
              title
              author
            }
          }
        `,
        variables: { text },
      })
      .then((result) => {
        setBookList(result.data.books)
      })
  }, [])

  const searchBook = useCallback(
    (text: string) => {
      fetchList(text)
      setSearchText(text)
    },
    [searchText]
  )

  useEffect(() => {
    fetchList()
  }, [])

  return (
    <div className="root">
      <h1>Book list</h1>
      <div>
        <h2>Search</h2>
        <div>
          <input
            type={'text'}
            value={searchText}
            onChange={(e) => searchBook(e.target.value)}
          />
        </div>
      </div>
      <div>
        <table className={'listTable'}>
          <thead>
            <tr>
              <th className={'headerTitle'} style={{width: '10%'}}>No.</th>
              <th className={'headerTitle'} style={{width: '40%'}}>title</th>
              <th className={'headerTitle'} style={{width: '40%'}}>Author</th>
            </tr>
          </thead>
          <tbody>
            {bookList.map((book, index) => {
              return (
                <tr key={index}>
                  <td className={'cell'}>{index + 1}</td>
                  <td className={'cell'}>{book.title}</td>
                  <td className={'cell'}>{book.author}</td>
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
