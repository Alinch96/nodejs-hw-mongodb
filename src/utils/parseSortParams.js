const parseSortBy = (value) => {
  if (typeof value !== 'string') return '_id';

  if (!['_id', 'name', 'email', 'contactType', 'isFavourite'].includes(value))
    return '_id';
  return value;
};

const parseSortOrder = (value) => {
  if (typeof value !== 'string') return 'asc';
  if (!['asc', 'desc'].includes(value)) return 'asc';
  return value;
};

export const parseSortParams = ({ sortBy, sortOrder }) => {
  return {
    sortBy: parseSortBy(sortBy),
    sortOrder: parseSortOrder(sortOrder),
  };
};
