export default function capitalizeEachWord(input) {
  let words = input.split(/\s+/);
  let capitalizedWords = words.map(
    (word) => word.charAt(0).toUpperCase() + word.slice(1)
  );
  let capitalizedString = capitalizedWords.join(" ");

  return capitalizedString;
}
