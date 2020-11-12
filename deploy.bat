git add *
git commit -m 'updates'
git push origin master
react-scripts build
cd build
gh-pages -b master -d .