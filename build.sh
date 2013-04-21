if [ ! -d gh-pages ]; then
  echo "gh-pages repository does not exist"
  git clone $(git remote -v | grep fetch | grep origin | awk '{ print $2 }') -b gh-pages gh-pages
fi

if [ -d gh-pages ]; then
  rm -rf gh-pages/* && cp -r src/* gh-pages
fi
