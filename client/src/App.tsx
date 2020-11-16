import React, { ChangeEvent, useCallback, useEffect, useState } from 'react'
import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
import 'reset-css'
import './App.css'

type BookList = {
  id: string
  title: string
  author: string
}[]

const client = new ApolloClient({
  uri: 'http://localhost:4000/',
  cache: new InMemoryCache(),
})

function App() {
  const [bookList, setBookList] = useState<BookList>([
    { id: '', title: '', author: '' },
  ])
  const [searchText, setSearchText] = useState<string>('')
  const [title, setTitle] = useState<string>('')
  const [author, setAuthor] = useState<string>('')
  const [modifyBookInfo, setModifyBookInfo] = useState<{
    modify: boolean
    id: string
    title: string
    author: string
  }>({ modify: false, id: '', title: '', author: '' })
  const intervalId = React.useRef<number>()

  const debounce = (func: () => void, delay: number) => {
    clearTimeout(intervalId.current)
    intervalId.current = window.setTimeout(func, delay)
  }

  const FETCH_BOOK_LIST = gql`
    query FetchBookListQuery($text: String!) {
      books(author: $text) {
        id
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
    mutation DeleteBookQuery($id: String!) {
      deleteBook(id: $id)
    }
  `

  const UPDATE_BOOK = gql`
    mutation UpdateBookQuery($input: UpdateBookTarget) {
      updateBook(input: $input)
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

  const deleteBook = useCallback(
    (id: string) => {

      client
        .mutate({
          mutation: DELETE_BOOK,
          variables: { id },
          fetchPolicy: 'no-cache',
        })
        .then((result) => {
          fetchList(searchText, true)
        })
    },
    [fetchList, searchText, DELETE_BOOK]
  )

  const switchModifyMode = useCallback(
    (modifyTarget: {
      modify: boolean
      id: string
      title: string
      author: string
    }) => {
      setModifyBookInfo(modifyTarget)
    },
    []
  )
  const updateModifyBook = useCallback((target: string, value: string) => {
    setModifyBookInfo(
      (prevState: {
        modify: boolean
        id: string
        title: string
        author: string
      }) => ({
        ...prevState,
        [target]: value,
      })
    )
  }, [])

  const updateBook = useCallback(
    (id: string) => {
      client
        .mutate({
          mutation: UPDATE_BOOK,
          variables: {
            input: {
              id: modifyBookInfo.id,
              title: modifyBookInfo.title,
              author: modifyBookInfo.author,
            },
          },
          fetchPolicy: 'no-cache',
        })
        .then((result) => {
          // TODO: 表示をシームレスにするなら更新の戻りをリストにする or 画面のリストも合わせて更新する
          fetchList()
          setModifyBookInfo({ modify: false, title: '', author: '', id: '' })
        })
    },
    [
      modifyBookInfo.id,
      modifyBookInfo.title,
      modifyBookInfo.author,
      UPDATE_BOOK,
      fetchList,
    ]
  )

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
              <th className={'title'} style={{width: '40px'}}>
                No.
              </th>
              <th className={'title'} style={{ width: '30%' }}>
                title
              </th>
              <th className={'title'} style={{ width: '30%' }}>
                Author
              </th>
              <th className={'title'} style={{ width: '30%' }}>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {bookList.map((book, index) => {
              const isModifyTarget =
                modifyBookInfo.modify && book.id === modifyBookInfo.id
              return (
                <tr key={index}>
                  <td className={'data'}>{index + 1}</td>
                  <td className={'data'}>
                    {isModifyTarget ? (
                      <input
                        type={'text'}
                        value={modifyBookInfo.title}
                        onChange={(e) =>
                          updateModifyBook('title', e.target.value)
                        }
                      />
                    ) : (
                      book.title
                    )}
                  </td>
                  <td className={'data'}>
                    {isModifyTarget ? (
                      <input
                        type={'text'}
                        value={modifyBookInfo.author}
                        onChange={(e) =>
                          updateModifyBook('author', e.target.value)
                        }
                      />
                    ) : (
                      book.author
                    )}
                  </td>
                  <td className={'action'}>
                    <input
                      type={'button'}
                      value={isModifyTarget ? 'Cancel' : 'Modify'}
                      onClick={() =>
                        switchModifyMode({
                          modify: !modifyBookInfo.modify,
                          id: book.id,
                          title: book.title,
                          author: book.author,
                        })
                      }
                    />
                    {isModifyTarget ? (
                      <input
                        type={'button'}
                        value={'Submit'}
                        onClick={() => updateBook(book.id)}
                      />
                    ) : null}
                    <input
                      type={'button'}
                      value={'Delete'}
                      onClick={() => deleteBook(book.id)}
                    />
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
