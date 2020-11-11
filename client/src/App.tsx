import React, { useCallback, useEffect, useState } from 'react'
import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
import logo from './logo.svg'
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
  const [bookList, setBookList] = useState<BookList>([])
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
        console.log(result)
        return result
      })
  }, [])

  useEffect(() => {
    fetchList()
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  )
}

export default App
