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

function parseBoxLine(line) {
  var parts = line.split(' ');
  return {
    letter: parts[0],
    left: parseInt(parts[1], 0),
    top: parseInt(parts[2], 0),
    right: parseInt(parts[3], 0),
    bottom: parseInt(parts[4], 0),
    rest: parts.slice(5).join(' ')
  }
}

function serializeBoxLine(box) {
  return [box.letter, box.left, box.top, box.right, box.bottom, box.rest].join(' ');
}

function splitLine(text, lineNumber, numWays) {
  var lines = text.split('\n');
  if (!lines[lineNumber]) {
    throw 'No line ' + lineNumber + ' in text';
  }

  var box = parseBoxLine(lines[lineNumber]);
  var x = function(idx) {  // idx is in 0..numWays
    return Math.round(box.left + (box.right - box.left) * idx / numWays);
  };

  var newBoxes = [];
  for (var i = 0; i < numWays; i++) newBoxes.push(i);
  newBoxes = newBoxes.map((_, i) => ({
    letter: box.letter,
    left: x(i),
    right: x(i + 1),
    top: box.top,
    bottom: box.bottom,
    rest: box.rest
  }));
  var newLines = newBoxes.map(serializeBoxLine),
      spliceArgs = [lineNumber, 1].concat(newLines);
  [].splice.apply(lines, spliceArgs);
  return lines.join('\n');
}

if (typeof(module) !== 'undefined') {
  module.exports = {
    countLines,
    startOfLinePosition,
    changeLetter,
    parseBoxLine,
    serializeBoxLine,
    splitLine
  };
}
