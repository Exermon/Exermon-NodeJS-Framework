clear:
	rm -rf dist

deploy:
	make clear
	git checkout deploy
	git merge main
	git push origin deploy
	git checkout main