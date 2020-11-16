const { ApolloServer, gql } = require("apollo-server");
const { v4: uuidv4 } = require("uuid");

const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.
  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
    id: String
    title: String
    author: String
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    books(author: String): [Book]
  }

  input InputBook {
    title: String
    author: String
  }

  type Mutation {
    addBook(input: InputBook): Int
    deleteBook(id: String!): Boolean
  }
`;

let books = [
  {
    id: "4371b53e-e8e0-489e-9d92-fc243bc9dc48",
    title: "The Awakening",
    author: "Kate Chopin",
  },
  {
    id: "f267b324-6dc5-4b01-8d33-7e6dbcd60710",
    title: "City of Glass",
    author: "Paul Auster",
  },
  {
    id: "eb9e1b15-37cb-4f6e-a3de-e3ffbe3a499e",
    title: "Apollo server example.",
    author: "Hiroaki Imai",
  },
];

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {
    books: (parent, args, context, info) => {
      return args.author === undefined ||
        args.author === null ||
        args.author === ""
        ? books
        : books.filter((value) => {
            return value.author.includes(args.author);
          });
    },
  },
  Mutation: {
    addBook: (parent, args, context, info) => {
      const requestData = args.input;
      if (requestData.title !== "" && requestData.author !== "") {
        const id = uuidv4();
        books.push({ ...requestData, id });
      }
      return books.length;
    },

    deleteBook: (parent, args, context, info) => {
      books = books.filter((book) => args.id !== book.id);
      return true;
    },
  },
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
