# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
yarn build

# 进入生成的文件夹
cd dist

# 如果是发布到自定义域名
echo 'faq.coulsonzero.shop' > CNAME

git init
git add -A
git commit -m 'deploy vue-golang-faq'

git push -f git@github.com:coulsonzero/vue-golang-faq.git master
# 如果发布到https://<USERNAME>.github.io/<REPO>
git push -f git@github.com:coulsonzero/vue-golang-faq.git master:gh-pages

cd -

rm -rf dist