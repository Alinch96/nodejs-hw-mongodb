import { ContactsCollection } from '../db/models/contacts.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';

export const getAllContacts = async ({
  page,
  perPage,
  sortBy,
  sortOrder,
  filter,
}) => {
  const contactQuery = ContactsCollection.find();
  if (filter.isFavourite !== undefined)
    contactQuery.where('isFavourite').equals(filter.isFavourite);
  if (filter.contactType)
    contactQuery.where('contactType').equals(filter.contactType);

  const skip = page > 0 ? (page - 1) * perPage : 0;

  const [count, contacts] = await Promise.all([
    ContactsCollection.countDocuments(contactQuery),
    contactQuery
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(perPage),
  ]);

  return {
    data: contacts,
    ...calculatePaginationData(count, page, perPage),
  };
};

export const getContactById = (contactId) => {
  return ContactsCollection.findById(contactId);
};

export const createContact = (payload) => {
  return ContactsCollection.create(payload);
};

export const updateContact = async (contactId, payload, options = {}) => {
  const rawResult = await ContactsCollection.findOneAndUpdate(
    { _id: contactId },
    payload,
    {
      new: true,
      includeResultMetadata: true,
      ...options,
    },
  );

  if (!rawResult || !rawResult.value) return null;

  return {
    updatedContact: rawResult.value,
    isNew: Boolean(rawResult?.lastErrorObject?.upserted),
  };
};

export const deleteContact = (contactId) => {
  return ContactsCollection.findOneAndDelete({ _id: contactId });
};
