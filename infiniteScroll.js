class InfiniteList{
	cache = {}
	lastVisible = 0
	lastInvisible = 0
	isForward = true

	constructor(parent, callback, id = 0, padding = 2, isVertical = true){
		this.padding = padding;
		this.parent = parent;
		this.requestNewLI = callback;
		this.isVertical = isVertical

		this.observer = new IntersectionObserver(
			entries => entries.map(entry=>this.processIntersection(entry)),
			{
				root: parent,
				rootMargin: "0px",
				threshold: [0, 1.0]
			}
		);
		this.lastInvisible = id - 1;
		this.createLI(id)
	}

	createLI(id){
		let node = this.requestNewLI(id)
		if(!node){return}
		node['_id'] = id;
		this.cache[id] = node;
		this.appendLI(id)
		this.observer.observe(node);
	}

	appendLI(id){
		let {parent, cache, isForward, isVertical} = this;
		let node = cache[id]
		if(node && !parent.contains(node)){
			parent[isForward? 'append' : 'prepend'](node)
			if(isVertical){
				!isForward && parent.scrollTo(0, node.offsetHeight+1)
			}else{
				!isForward ?
					parent.scrollTo(node.offsetWidth+1, 0):
					parent.scrollTo(parent.scrollWidth-node.offsetWidth*4, 0)
			}
		}
	}

	removeLI(){
		let {parent, lastInvisible, isForward, cache, padding} = this;
		let node = parent[isForward ? 'firstChild' : 'lastChild'];
		if(!node){return}
		let id = node._id;
		let distanceToVisible = lastInvisible - id;
		let isOutsideOfPadding = distanceToVisible > +padding ||
										 distanceToVisible < -padding;

		isOutsideOfPadding && cache[id].remove()
	}

	processIntersection(entry){
		if(!entry.isIntersecting){
			this.lastInvisible = entry.target._id;
		}else{
			this.lastVisible = entry.target._id;
		}
		this.isForward = this.lastInvisible < this.lastVisible;


		let id = this.lastVisible + (this.isForward ? 1 : -1);
		!this.cache[id] ? this.createLI(id) : this.appendLI(id);

		this.removeLI()
	}
}