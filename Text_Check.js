(function(ext) {
  ext.neContientQue = function(texte, caracteres) {
    for (let i = 0; i < texte.length; i++) {
      if (!caracteres.includes(texte[i])) {
        return false;
      }
    }
    return true;
  };

  var descriptor = {
    blocks: [
      ['b', ' text %s contains only character from %s', 'neContientQue', '', ''],
    ],
  };

  ScratchExtensions.register('Text Check', descriptor, ext);
})({});