import { ContactsCollection } from '../db/models/contacts.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';

export const getAllContacts = async ({
  page,
  perPage,
  sortBy,
  sortOrder,
  filter,
  userId,
}) => {
  const contactQuery = ContactsCollection.find();
  contactQuery.where('userId').equals(userId);
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

export const getContactById = ({ contactId, userId }) => {
  return ContactsCollection.findOne({ _id: contactId, userId });
};

export const createContact = (payload, { _id }) => {
  return ContactsCollection.create({ ...payload, userId: _id });
};

export const updateContact = (contactId, userId, payload) =>
  ContactsCollection.findOneAndUpdate({ _id: contactId, userId }, payload, {
    new: true,
  });

export const deleteContact = ({ contactId, userId }) => {
  return ContactsCollection.findOneAndDelete({ _id: contactId, userId });
};
