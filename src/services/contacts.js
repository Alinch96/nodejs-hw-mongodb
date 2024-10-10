import { ContactsCollection } from '../db/models/contacts.js';

export const getAllContacts = async () => {
  return ContactsCollection.find();
};

export const getContactById = async (contactId) => {
  return ContactsCollection.findById(contactId);
};
