require(['sem/sem'], function(sem){
	sem.open('employees', 'label', function onCreate(tr){
		debugger;
		//tr.createTable('tb2', {col1: 'bool', col2: 'int'});
		debugger;
	}, function onOpen(db){
		db.dropTable('employees');
		db.createTable('employees', {emp_no: 'int', birth_date: 'string', first_name: 'string(14)', last_name: 'string(16)',
			gender: 'string(1)', hire_date: 'string'});
		db.transaction(function(tr) {
			//tr.insertRow('tb1', {col1: false, col2: '3'});
			var sql = "INSERT INTO employees VALUES " +
				"(10001,'1953-09-02','Georgi','Facello','M','1986-06-26')," +
				"(10002,'1964-06-02','Bezalel','Simmel','F','1985-11-21')," +
				"(10003,'1959-12-03','Parto','Bamford','M','1986-08-28')";
			sql = "INSERT INTO employees (emp_no, birth_date, first_name, last_name, gender, hire_date) VALUES (10002,'1964-06-02','Bezalel','Simmel','F','1985-11-21'),(10003,'1959-12-03','Parto','Bamford','M','1986-08-28'),(10004,'1954-05-01','Chirstian','Koblick','M','1986-12-01'),(10005,'1955-01-21','Kyoichi','Maliniak','M','1989-09-12'),(10006,'1953-04-20','Anneke','Preusig','F','1989-06-02'),(10019,'1953-01-23','Lillian','Haddadi','M','1999-04-30'),(10020,'1952-12-24','Mayuko','Warwick','M','1991-01-26'), (10021,'1960-02-20','Ramzi','Erde','M','1988-02-10')";
			tr.tr.executeSql(sql, null, function(){
				console.log('insert');
			}, function(e){
				console.error(e);
			});
		});

/*
		db.insertRows('employees', [{emp_no: 10001, birth_date: '1953-09-02', first_name: 'Georgi', last_name: 'Facello', gender: 'M', hire_date: '1985-11-21'}]);
*/
		db.printTable('employees');


/*
		//db.createTable('tb1', {col1: 'bool', col2: 'int'});
		db.insertRows('tb1', [{col1: false, col2: '3'}, {col1: true, col2: '2'}, {col1: false, col2: '1'}])
		db.printTable('tb1')
*/

	}, function (err){
		//	handler(err);
	}, function(){
		//	handler();
	});

});