import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { FetchPolicy } from 'apollo-client';

@Injectable({
  providedIn: 'root'
})
export class HubService {

  constructor(
    private apollo: Apollo,
  ) { }

  async createHub(name: string, description: string, image: string, latitude: number, longitude: number) {
    const result = await this.apollo.mutate({
      mutation: gql`
      mutation {
        createHub(image: "${image}", name: "${name}", description: "${description}" latitude: ${latitude}, longitude: ${longitude}) {
          id
          name
          description
          image
          latitude
          longitude
        }
      }
      `
    }).toPromise();

    console.log(result);
    const response = (result as any).data.createHub;

    if (response) {
      console.log("createHub successful.");
    } else {
      console.log("createHub failure");
    }

    return response;
  }

  async usersHubs(fetchPolicy: FetchPolicy = "network-only") {
    const result = await this.apollo.query({
      query: gql`
      query {
        usersHubs{
          userId
          hubId
          isOwner
          starred
          isPresent
          hub {
            id
            name
            description
            active
            image
            latitude
            longitude
            usersConnection {
              isPresent
              isOwner
            }
          }
        }
      }
      `,
      fetchPolicy
    }).toPromise();

    const response = result.data["usersHubs"];

    if (response) { 
      console.log("usersHubs successful.");
    } else {
      console.log("usersHubs failure");
    }

    return response;
  }

  async usersPeople(fetchPolicy: FetchPolicy = "network-only") {
    const result = await this.apollo.query({
      query: gql`
      query {
        usersPeople {
          id
          firstName
          lastName
          description
          image
        }
      }
      `,
      fetchPolicy
    }).toPromise();

    const response = result.data["usersPeople"];

    if (response) { 
      console.log("usersPeople successful.");
    } else {
      console.log("usersPeople failure");
    }

    return response;
  }

  async commonUsersHubs(otherUsersId: number, fetchPolicy: FetchPolicy = "network-only") {
    const result = await this.apollo.query({
      query: gql`
      query {
        commonUsersHubs(otherUsersId: ${otherUsersId}) {
          userId
          hubId
          isOwner
          starred
          isPresent
          hub {
            id
            name
            active
            image
            latitude
            longitude
            usersConnection {
              isPresent
              isOwner
            }
          }
        }
      }
      `,
      fetchPolicy
    }).toPromise();

    const response = result.data["commonUsersHubs"];

    if (response) { 
      console.log("commonUsersHubs successful.");
    } else {
      console.log("commonUsersHubs failure");
    }

    return response;
  }

  async editHub(hubId: number, name: string, description: string) {
    const result = await this.apollo.mutate({
      mutation: gql`
      mutation {
        editHub(hubId: ${hubId}, name: "${name}", description: "${description}") {
          id
          name
          description
        }
      }
      `,
      // fetchPolicy
    }).toPromise();

    console.log(result);
    const response = (result as any).data.editHub;

    if (response) {
      console.log("editHub successful.");
    } else {
      console.log("editHub failure");
    }

    return response;
  }

  async hub(id: number, fetchPolicy: FetchPolicy = "network-only") {
    const result = await this.apollo.query({
      query: gql`
      query {
        hub(id: ${id}) {
          userId
          hubId
          isOwner
          starred
          isPresent
          hub {
            id
            name
            description
            active
            image
            latitude
            longitude
            usersConnection {
              user {
                id
                firstName
                lastName
                description
                image
              }
              isOwner
              isPresent
            }
            microChats {
              id
              text
            }
          }
        }
      }
      `,
      fetchPolicy
    }).toPromise();

    console.log(result);
    const response = result.data["hub"];

    if (response) {
      console.log("got hub successful.");
    } else {
      console.log("hub query failure");
    }

    return response;
  }

  async inviteUserToHub(hubId: number, inviteesEmail: string) {
    const result = await this.apollo.mutate({
      mutation: gql`
      mutation {
        inviteUserToHub(hubId: ${hubId}, inviteesEmail: "${inviteesEmail}")
      }
      `
    }).toPromise();

    console.log(result);
    const response = (result as any).data.inviteUserToHub;
    return response;
  }


  async getHubByQRImage(qrImageB64: string, fetchPolicy: FetchPolicy = "network-only"): Promise<boolean> {
    const result = await this.apollo.query({
      query: gql`
      query {
        getHubByQRImage(qrImageB64: "${qrImageB64}") {
          id
          name
          image
          owners {
            id
            firstName
            lastName
            email
          }
          members {
            id
            firstName
            lastName
            email
          }
        }
      }
      `,
      fetchPolicy
    }).toPromise();

    console.log(result);
    const response = result.data["getHubByQRImage"];
    if (response) {
      console.log("got hub successful.");
    } else {
      console.log("hub query failure");
    }

    return response;
  }

  async joinHub(id: number): Promise<boolean> {
    const result = await this.apollo.mutate({
      mutation: gql`
      mutation {
        joinHub(id: ${id})
      }
      `
    }).toPromise();

    console.log(result);
    const response = (result as any).data.joinHub;
    return response;
  }

  async deleteHub(id: number): Promise<boolean> {
    const result = await this.apollo.mutate({
      mutation: gql`
      mutation {
        deleteHub(hubId: ${id})
      }
      `
    }).toPromise();

    console.log(result);
    const response = (result as any).data.deleteHub;
    return response;
  }

  async changeHubImage(id: number, image: string): Promise<boolean> {
    const result = await this.apollo.mutate({
      mutation: gql`
      mutation {
        changeHubImage(hubId: ${id}, newImage: "${image}")
      }
      `
    }).toPromise();

    console.log(result);
    const response = (result as any).data.changeHubImage;
    return response;
  }

  async setHubStarred(hubId: number) {
    const result = await this.apollo.mutate({
      mutation: gql`
      mutation {
        setHubStarred(hubId: ${hubId})
      }
      `
    }).toPromise();

    console.log(result);
    const response = (result as any).data.setHubStarred;
    return response;
  }

  async setHubNotStarred(hubId: number) {
    const result = await this.apollo.mutate({
      mutation: gql`
      mutation {
        setHubNotStarred(hubId: ${hubId})
      }
      `
    }).toPromise();

    console.log(result);
    const response = (result as any).data.setHubNotStarred;
    return response;
  }

  async enteredHubGeofence(hubId: number) {
    const result = await this.apollo.mutate({
      mutation: gql`
      mutation {
        enteredHubGeofence(hubId: ${hubId})
      }
      `
    }).toPromise();
    
    console.log(`enteredHubGeofence hubId ${hubId} returned ${result}`);
    return result;
  }

  async exitedHubGeofence(hubId: number) {
    const result = await this.apollo.mutate({
      mutation: gql`
      mutation {
        exitedHubGeofence(hubId: ${hubId})
      }
      `
    }).toPromise();
    
    console.log(`exitedHubGeofence hubId ${hubId} returned ${result}`);
    return result;
  }

  async activateHub(hubId: number) {
    const result = await this.apollo.mutate({
      mutation: gql`
      mutation {
        activateHub(hubId: ${hubId}) {
          id
          active
        }
      }
      `
    }).toPromise();
    
    console.log(`exitedHubGeofence hubId ${hubId} returned ${result}`);
    return result;
  }

  async deactivateHub(hubId: number) {
    const result = await this.apollo.mutate({
      mutation: gql`
      mutation {
        deactivateHub(hubId: ${hubId}) {
          id
          active
        }
      }
      `
    }).toPromise();
    
    console.log(`exitedHubGeofence hubId ${hubId} returned ${result}`);
    return result;
  }

  async sendMicroChat(hubId: number, microChatId) {
    const result = await this.apollo.mutate({
      mutation: gql`
      mutation {
        microChatToHub(hubId: ${hubId}, microChatId: ${microChatId}) {
          id
          text
        }
      }
      `
    }).toPromise();
    return result;
  }

  async createMicroChat(hubId: number, microChatText: string) {
    const result = await this.apollo.mutate({
      mutation: gql`
      mutation {
        createMicroChat(hubId: ${hubId}, microChatText: "${microChatText}") {
          id
          text
        }
      }
      `
    }).toPromise();
    return result;
  }

  async deleteMicroChat(hubId: number, microChatId: number) {
    const result = await this.apollo.mutate({
      mutation: gql`
      mutation {
        deleteMicroChat(hubId: ${hubId}, microChatId: ${microChatId})
      }
      `
    }).toPromise();
    return result;
  }
}
