var lectureapp = lectureapp || {}

lectureapp.annotation_data = 	[
								[0,0,0,0,0,0,0,0],
								[0,0,0,0,0,0,0,0],
								[0,0,0,0,0,0,0,0],

								[0,0,0,0,0,0,0,0],
								[0,0,0,0,0,0,0,0],
								[0,0,0,0,0,0,0,0],

								[0,0,0,0,0,0,0,0],
								[0,0,0,0,0,0,0,0],
								[0,0,0,0,0,0,0,0],

								[0,0,0,0,0,0,0,0],
								[0,0,0,0,0,0,0,0],
								[0,0,0,0,0,0,0,0],

								[0,0,0,0,0,0,0,0],
								[0,0,0,0,0,0,0,0],
								[0,0,0,0,0,0,0,0],

								[0,0,0,0,0,0,0,0],
								[0,0,0,0,0,0,0,0],
								[0,0,0,0,0,0,0,0],

								];

lectureapp.color_code = ['00FF00','22FF00','44FF00',
						'66FF00','88FF00',
						'AAFF00','CCFF00','EEFF00',
						'FFEE00','FFCC00',
						'FFAA00','FF8800','FF6600',
						'FF4400','FF2200','FF0000'];


function init(slide_id) {
	lectureapp.slide_id = slide_id;
	populate_annotation_board(1);
	// $(".signaller").on("swipe",function(){
	// 	$(this).hide();
	// });
}

function load_chart(annotations) {
	var ctx = document.getElementById("confusion-chart").getContext("2d");
	console.log(annotations);
	var data = {
		labels: [],
		datasets: [
			{
				label: "My First dataset",
				fillColor: "rgba(220,220,220,0.2)",
				strokeColor: "rgba(220,220,220,1)",
				pointColor: "rgba(220,220,220,1)",
				pointStrokeColor: "#fff",
				pointHighlightFill: "#fff",
				pointHighlightStroke: "rgba(220,220,220,1)",
				data: []
			}
		]
	};

	//Update the data array
	//[0,0,1,0,0]
	var i = 0;
	while (i < annotations.length) {
		if (data.labels.length < annotations[i]._id) {
			data.labels.push(data.labels.length+1);
			data.datasets[0].data.push(0);
		} else {
			data.datasets[0].data[annotations[i]._id-1] = annotations[i].confusionCount;
			i++;
		}
	}

	var myLineChart = new Chart(ctx).Line(data, {});
}

function toggle_signal(slide_id,x,y) {
	console.log(x,y);
	if (lectureapp.annotation_data[x][y] == 0) {
		lectureapp.annotation_data[x][y] = 1;
	} else {
		lectureapp.annotation_data[x][y] = 0;
	}
	// write_to_annotation_board();
	update_annotation_cell(x,y);

	$.get("/annotate", { 
		pdf_id: slide_id, 
		slide_page: $("#pdf-frame").contents().find("#pageNumber")[0].value, 
		x_val:x, 
		y_val:y
	}).done(function(data){
		lectureapp.annotation_data[x][y] = data.result;
		update_annotation_cell(x,y);
		// populate_annotation_board($("#pdf-frame").contents().find("#pageNumber")[0].value);
	});
}

function clear_page_annotation(slide_id) {
	var currpage = $("#pdf-frame").contents().find("#pageNumber")[0].value
	$.get("/clear/annotate", { 
		pdf_id: lectureapp.slide_id,
		page: currpage
	}).done(function(data){
		lectureapp.data = data;
		var result = data.result;
		populate_annotation_board(currpage);
	});	
}

function update_annotation_cell(x,y) {
	color_index = lectureapp.annotation_data[x][y]-1;
	if (color_index >= 0) {
		$('#annotation-cell-' + x + '-' + y).css({'background':"#"+lectureapp.color_code[color_index], 'opacity':0.3});
	} else {
		$('#annotation-cell-' + x + '-' + y).css({'background':'none'});
	}
}

function hide_annotations() {
	$("#annotation-board").css({'display':'none'});
	$("#hide-annotations").css({'display':'none'});
	$("#show-annotations").css({'display':'inline'});
}

function show_annotations() {
	$("#annotation-board").css({'display':'block'});
	$("#hide-annotations").css({'display':'inline'});
	$("#show-annotations").css({'display':'none'});
}

function go_fullscreen() {
	var pdf_frame = document.getElementById('pdf-frame');
	var doc = pdf_frame.contentDocument? pdf_frame.contentDocument: pdf_frame.contentWindow.document;
	var fullscreen_button = doc.getElementById('fullscreen');
	fullscreen_button.click();
}

function write_to_annotation_board() {
	for(var i = 0; i < lectureapp.annotation_data.length; i++) {
		for(var j = 0; j < lectureapp.annotation_data[0].length; j++) {
			if (lectureapp.annotation_data[i][j] >= 1) {
				var color_index = (lectureapp.annotation_data[i][j]-1)*5;
				if (color_index > lectureapp.color_code.length) {
					color_index = lectureapp.color_code.length;
				}
				$('#annotation-cell-' + i + '-' + j).css({'background':"#"+lectureapp.color_code[color_index], 'opacity':0.3});
			} else {
				$('#annotation-cell-' + i + '-' + j).css({'background':'none'});
			}
		}
	}
}


function populate_annotation_board(currpage) {
	$.get("/get/annotate", { 
		pdf_id: lectureapp.slide_id
	}).done(function(data){
		lectureapp.data = data;
		var result = data.result;
		console.log(result);
		lectureapp.annotation_data = 	[
										[0,0,0,0,0,0,0,0],
										[0,0,0,0,0,0,0,0],
										[0,0,0,0,0,0,0,0],

										[0,0,0,0,0,0,0,0],
										[0,0,0,0,0,0,0,0],
										[0,0,0,0,0,0,0,0],

										[0,0,0,0,0,0,0,0],
										[0,0,0,0,0,0,0,0],
										[0,0,0,0,0,0,0,0],

										[0,0,0,0,0,0,0,0],
										[0,0,0,0,0,0,0,0],
										[0,0,0,0,0,0,0,0],

										[0,0,0,0,0,0,0,0],
										[0,0,0,0,0,0,0,0],
										[0,0,0,0,0,0,0,0],
										
										[0,0,0,0,0,0,0,0],
										[0,0,0,0,0,0,0,0],
										[0,0,0,0,0,0,0,0],
										];

		for(var i = 0; i < result.length; i++) {
			if (result[i].page == currpage) {
				lectureapp.annotation_data[result[i].x][result[i].y] += 1;
			}
		}
		write_to_annotation_board();
	});	
}