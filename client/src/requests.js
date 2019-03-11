import { isLoggedIn, getAccessToken } from './auth';

const endpointURL = 'http://localhost:9000/graphql'

async function graphqlRequest(query, variables={}) {
    const request = {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({ query, variables })
    };
    if (isLoggedIn()){
        request.headers.authorization = 'Bearer ' + getAccessToken();
    }
    const response = await fetch(endpointURL, request);

    const responseBody = await response.json();
    if (responseBody.errors) {
        const message = responseBody.errors.map(item => item.message).join('');
        throw new Error(message);
    }
    return responseBody.data;
}

export async function loadJobs() {
    const query = `{
        jobs {
          id
          title
          company {
            id
            name
          }
        }
      }`;
    const data = await graphqlRequest(query);
    return data.jobs;
}

export async function loadJob(id) {
    const query = `query JobQuery($id: ID!) {
        job(id: $id) {
          id
          title
          company {
            name
            id
          }
          description
        }
      }`;
    const variables = {id};
    const data = await graphqlRequest(query, variables)
    return data.job;
}

export async function loadCompany(id) {
    const query = `query CompanyQuery($id: ID!){
        company(id: $id) {
          name
          description
          jobs {
              title
              id
          }
        }
      }`;
    const variables = {id};
    const data = await graphqlRequest(query, variables);
    return data.company;
}

export async function createJob(input) {
    const mutation = `mutation createJobMutation($input: CreateJobInput){
        job: createJob(input: $input) {
        id
        title
        description
        company {
          name
        }
      }
    }`
    const variables = {input}
    const data = await graphqlRequest(mutation, variables);
    return data.job;
}