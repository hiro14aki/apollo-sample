import React, { useCallback, useEffect, useState } from 'react'
import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
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

  const fetchList = useCallback(() => {
    client
      .query({
        query: gql`
          {
            books {
              title
              author
            }
          }
        `,
      })
      .then((result) => {
        setBookList(result.data.books)
      })
  }, [])

  useEffect(() => {
    fetchList()
  }, [])

  return (
    <div className="root">
      <h1>Book list</h1>
      <div>
        <h2>Search</h2>
      </div>
      <div>
        <table>
          <thead>
            <tr>
              <th className={'headerTitle'}>No.</th>
              <th className={'headerTitle'}>title</th>
              <th className={'headerTitle'}>Author</th>
            </tr>
          </thead>
          <tbody>
            {bookList.map((book, index) => {
              return (
                <tr>
                  <td>{index + 1}</td>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
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
