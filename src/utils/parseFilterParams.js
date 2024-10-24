const parseIsFavourite = (value) => {
  if (typeof value !== 'string') return;
  if (!['true', 'false'].includes(value)) return;
  return value;
};

const parseContactType = (value) => {
  if (typeof value !== 'string') return;
  if (!['work', 'home', 'personal'].includes(value)) return;
  return value;
};

export const parseFilterParams = ({ isFavourite, contactType }) => {
  return {
    isFavourite: parseIsFavourite(isFavourite),
    contactType: parseContactType(contactType),
  };
};
