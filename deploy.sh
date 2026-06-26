# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
yarn build

cd dist

# 如果是发布到自定义域名
echo 'faq.coulsonzero.shop' > CNAME

git init
git add -A
git commit -m 'deploy vue-faq'

git push -f git@github.com:coulsonzero/vue-faq.git master:gh-pages

cd -

rm -rf dist