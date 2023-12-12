clear:
	rm -rf dist

deploy:
	make clear
	git checkout deploy
	git merge main
	git push deploy deploy
	git checkout main