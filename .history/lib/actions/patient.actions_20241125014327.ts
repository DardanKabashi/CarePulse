"use server";

import { ID, Query } from "node-appwrite";
import { BUCKET_ID, DATABASE_ID, databases, ENDPOINT, PATIENT_COLLECTION_ID, PROJECT_ID, storage, users } from "../appwrite.config";
import { parseStringify } from "../utils";

import { InputFile } from "node-appwrite/file"

export const createUser = async (user: CreateUserParams) => {
  try {
    const newuser = await users.create(
      ID.unique(),
      user.email,
      user.phone,
      undefined,
      user.name
    );
    return parseStringify(newuser);
  } catch (error: any) {
    if (error && error.code === 409) {
      const existingUser = await users.list([
        Query.equal("email", [user.email]),
      ]);
      return existingUser.users[0];
    }
    throw error;
  }
};

export const getUser = async (userId: string) => {
    try {
        const user = await users.get(userId);

        return parseStringify(user);
    }  catch (error) {
        console.log(error);
    }
}

export const registerPatient = async ({ identificationDocument, ...patient }: 
RegisterUserParams) => {
  try {
    let file;

    if (identificationDocument) {
      const inputFile = InputFile.fromBuffer(
          identificationDocument?.get("blobFile") as Blob,
          identificationDocument?.get("fileName") as string,
        );

      file = await storage.createFile(BUCKET_ID!, ID.unique(), inputFile);
    }

    console.log({gender: patient.gender})

    const newPatient = await databases.createDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      ID.unique(),
      {
        identificationDocumentId: file?.$id ? file.$id : null,
        identificationDocumentUrl: `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/$
        {file?.$id}/view?project=${PROJECT_ID}`,
        ...patient
      }
    )

    return parseStringify(newPatient);
  } catch (error) {
    console.log(error);
  }
  }