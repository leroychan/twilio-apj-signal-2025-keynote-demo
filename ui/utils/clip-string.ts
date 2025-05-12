export function clipString(item: string, maxLength: number = 30) {
  // Return the original string if it's shorter than or equal to the maxLength
  if (item.length <= maxLength) return item;

  // find the end of the word that contains the maxLength character
  let truncateAt = maxLength;
  while (truncateAt < item.length && item[truncateAt] !== " ") truncateAt++;

  // if we hit the end and it's one long word, truncate at maxLength
  if (truncateAt === item.length && item.indexOf(" ") === -1) {
    return item.substring(0, maxLength) + "...";
  }

  return item.substring(0, truncateAt) + "...";
}
