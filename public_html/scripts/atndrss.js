$(function(){	
	rssLink = new RssLink($("#rss-link"));
	search = new Search($('[name="keyword"]'));
	message = new Message($('#message'));
	eventList = new EventList($("#event-list"));
	
	$('[name="keyword"]').keydown(function(e){
		if(e.keyCode==13){
			search.doit();
		}
	});
	
	$('#search-btn').bind('tap', function(){
		search.doit();
	});
});

Search = function(text_box_element){
	this.text_box_element = text_box_element;
	this.getKeyword = function(){
		return this.text_box_element.val();
	}
	this.doit = function(){
		rssLink.element.hide();
		message.element.hide();
		eventList.element.hide();
		
		keyword = search.getKeyword();
		if(keyword.length > 0){
			$.mobile.showPageLoadingMsg();
			eventList.get(keyword, function(){
				if (eventList.num > 0){
					rssLink.show();
					eventList.show(function(){
						$.mobile.hidePageLoadingMsg();
					});
				}else{
					message.show("「"+ keyword +"」に関連するイベントは行われていないようです・・・");
					$.mobile.hidePageLoadingMsg();
				}
			});
		}else{
			message.show("何かキーワードを入力して下さい。");
		}
	}
}

Message = function(element){
	this.element = element;
	this.element.hide();
	this.show = function(msg){
		this.element.html(msg);
		Animate.slideDownUp(this.element);
	}
}

Animate = function(){}
Animate.slideDownUp = function(element){
	element.slideDown();
	element.oneTime(5000,function(){
		element.slideUp("slow");
	});
}

RssLink = function(element){
	this.element = element;
	this.element.hide();
	this.show = function(){
		this.element.find(".keyword").html(keyword);
		this.element.find("a").attr('href', 'http://api.atnd.org/events/?format=atom&keyword='+ encodeURIComponent(keyword));
		this.element.slideDown("slow");
		this.element.listview('refresh');
	}
}

EventList = function(element){
	this.element = element;
	this.element.hide();
	this.data;
	this.num;
	this.get = function(keyword, callback){
		request_url = "http://api.atnd.org/events?callback=?";
		request_params = {
			format:"jsonp",
			keyword: keyword
		}
		
		var scope = this; 
		$.getJSON(request_url, request_params, function(data){
			scope.data = data;
			scope.num = data.results_available; 
			callback();
		});
	}
	this.show = function(callback){
		oneEvent = this.element.find("li#template");
		divider = this.element.find('[data-role="list-divider"]');
		this.element.empty();
		this.element.append(divider);
		this.element.append(oneEvent);
		$.each(this.data.events, function(){
			oneEvent.clone(true).insertAfter(oneEvent);
			
			oneEvent.find("a").attr('href','http://atnd.org/events/'+ this.event_id);
			
			oneEvent.find("a").find(".title").html(this.title);
			oneEvent.find("a").find(".catch").html(this.catch);
			oneEvent.find("a").find(".address").html(this.address);
			
			month = this.started_at.substring(5,7);
			day = this.started_at.substring(8,10);
			if(month.match(/0./g)){	month = month.replace('0', '');}
			if(day.match(/0./g)){	day = day.replace('0', '');}
			oneEvent.find("a").find(".date").html(month+'月'+day+'日');
			
			oneEvent.removeAttr("id");
		});
		this.element.slideDown("slow");
		this.element.listview('refresh');
		callback();
	}
}