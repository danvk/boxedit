function countLines(text, position) {
  var count = 0;
  for (var i = 0; i < position; i++) {
    if (text.charAt(i) == '\n') count++;
  }
  return count;
}

function startOfLinePosition(text, lineNumber) {
  var count = 0;
  for (var i = 0; i < text.length; i++) {
    if (text.charAt(i) == '\n') {
      count++;
      if (count >= lineNumber) return i + 1;
    }
  }
  return i;
}

function changeLetter(text, lineNumber, newLetter) {
  var lines = text.split('\n');
  if (!lines[lineNumber]) {
    throw 'No line ' + lineNumber + ' in text';
  }

  var lineParts = lines[lineNumber].split(' ');
  lineParts[0] = newLetter;
  lines[lineNumber] = lineParts.join(' ');
  return lines.join('\n');
}
