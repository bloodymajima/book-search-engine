import { gql } from "@apollo/client";

export const GET_ME = gql`
  query me {
    me {
      bookCount
      savedBooks {
        title
        author
      }
    }
  }
`;