define([
],
function()
{
	var Trans = function(tr)
	{
		this.tr = tr;
	};

	var ReadTrans = function(tr)
	{
		this.tr = tr;
	};


	ReadTrans.prototype =
	{
		query: function (table, index, callback, param) {
			var sql = 'SELECT * FROM "' + table + '"';
			var cols = [];
			var args = [];
			if (index)
			{
				for (var col in index)
				{
					var value = index[col];
					if (value.hasOwnProperty('eq'))
					{

					}
					var min = value.min;
					var max = value.max;
					if (min == max)
					{
						cols.push(col + ' = ?');
						args.push(min);
						continue;
					}
					if (min)
					{
						cols.push(col + ' >= ?');
						args.push(min);
					}
					if (max)
					{
						cols.push(col + ' <= ?');
						args.push(max);
					}

				}
			}
			if (cols)
			{
				sql += ' WHERE ';
				for (var i = 0; i < cols.length; i++)
				{
					if (i && i != cols.length - 1)
					{
						sql += ' AND';
					}
					sql += cols[i];
				}
			}
			this.tr.executeSql(sql, args, function(trans, result){
				var len = result.rows.length;
				for (var i = 0; i < len; i++)
				{
					callback(result.rows.item(i), param);
				}
			}, function(trans, err){
				debugger;
			});
		}
	};

	Trans.prototype =
	{
		query: ReadTrans.prototype.query,

// ***************************** DDL *****************************************************
		createTable: function(name, columns, handler)
		{
			var colTypes = ['bool', 'string(bytes)', 'int(bytes)', 'ref(tb)'];
			var sql = 'CREATE TABLE "' + name + '" (' +
				'id INTEGER PRIMARY KEY AUTOINCREMENT, ';
			var refs = [];
			for (var col in columns)
			{
				var type = columns[col];
				var sqlType = '';
				if (type == 'bool')
				{
					sqlType = 'BOOL';
				}
				else if (type.indexOf('string') == 0)
				{
					sqlType = 'STRING';
				}
				else if (type.indexOf('int') == 0)
				{
					sqlType = 'INTEGER';
				}
				else if (type.indexOf('ref') == 0)
				{
					sqlType = 'INTEGER';
					refs.push('');
				}
				else
				{
					throw new Error('Invalid column type!');
				}
				sql += col + ' ' + type + ', ';
			}
			sql = sql.substr(0, sql.length - 2);
			sql += ')';
			this.tr.executeSql(sql, null, handler);
		},

		updateTable: function(name)
		{
			this.tr.executeSql('ALTER TABLE ' + name + "");
		},

		dropTable: function(name)
		{
			this.tr.executeSql('DROP TABLE ' + name + "");
		},

// ********************** Data modification ****************************************************
		insert: function(table, data, handler)
		{
			var sql = 'INSERT INTO "' + table + '" (';
			var cols = [];
			for (var col in data)
			{
				sql += col;
				cols.push(data[col]);
				sql += ', ';
			}
			sql = sql.substr(0, sql.length - 2);
			sql += ') VALUES (';
			for (var i = 0; i < cols.length; i++)
			{
				sql += '?, ';
			}
			sql = sql.substr(0, sql.length - 2);
			sql += ')';
			this.tr.executeSql(sql, cols, handler);
		},

		update: function(table)
		{
			this.tr.executeSql('UPDATE ' + table + "");
		},

		remove: function(table, id, handler)
		{
			var params = [id];
			this.tr.executeSql('DELETE FROM "' + table + '" WHERE id = ?', params, function(res){
				handler(res, null);
			}, function(err){
				handler(null, err);
			});
		}

	};

	var DB = function(db) {
		this.db = db;
	};

	DB.prototype =
	{
		transaction: function(operations, onError, onSuccess)
		{
			this.db.transaction(function(r){
				operations(new Trans(r));
			}, onError, onSuccess);
		},

		readTransaction: function(operations, onError, onSuccess)
		{
			this.db.readTransaction(function(r){
				operations(new Trans(r));
			}, onError, onSuccess);
		}
	};

return {
	open: function(name, createHandler, openHandler)
	{
		var db = openDatabase(name, '', 'displayName', 1024 * 1024 * 1);
		// https://code.google.com/p/chromium/issues/detail?id=324593
		var sem = new DB(db);
		if (db.version)
		{
			openHandler(sem);
		}
		else
		{
			db.changeVersion(db.version, '1', function(tr){
				createHandler(new Trans(tr));
			}, function onErr(err){
				debugger;
			}, function onSucc(){
				openHandler(sem);
			});
		}
	},

// ************************ Version *********************************************************
	driver: {name: '4 chrome', version: 1}
}
});