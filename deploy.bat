git add *
git commit -m 'updates'
git push origin master
npm run build
cd build
gh-pages -b master -d .