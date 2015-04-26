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
		query: function (table, onCol, callback, param) {
			var sql = 'SELECT * FROM "' + table + '"';
			var cols = [];
			var args = [];
			if (onCol)
			{
				for (var col in onCol)
				{
					var value = onCol[col];
					if (value.hasOwnProperty('eq'))
					{
						cols.push(col + ' = ?');
						args.push(value.eq);
						continue;
					}
					if (value.hasOwnProperty('lt'))
					{
						cols.push(col + ' < ?');
						args.push(value.lt);
						continue;
					}
					if (value.hasOwnProperty('gt'))
					{
						cols.push(col + ' > ?');
						args.push(value.lt);
						continue;
					}
				}
			}
			if (cols.length)
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
	// Creates a table. Columns object defines column types
	createTable: function(name, columns, handler)
	{
		var colTypes = ['bool', 'string(bytes)', 'int(bytes)', 'ref(tb)'];
		var sql = 'CREATE TABLE "' + name + '" (' +
			'id INTEGER PRIMARY KEY AUTOINCREMENT, ';
		var refs = [];
		for (var colName in columns)
		{
			var type = columns[colName];
			var sqlType = '';
			var reRes = [];
			if (type == 'bool')
			{
				sqlType = 'BOOL';
			}
			else if (type == 'real')
			{
				sqlType = 'REAL';
			}
			else if ((reRes = /^string(?:\(\s*(\d+)\s*\))?$/.exec(type)) != null)
			{
				sqlType = 'STRING';
				if (reRes[1])
				{
					sqlType += '(' + reRes[1] + ')';
				}
			}
			else if ((reRes = /^int(?:(\s*(\d+)\s*)\))?$/.exec(type)) != null)
			{
				sqlType = 'INTEGER';
			}
			else if ((reRes = /^ref\(\s*(\S+)\s*\)$/.exec(type)) != null)
			{
				sqlType = 'INTEGER REFERENCES ' + reRes[1] + '(id)';
				refs.push('');
			}
			else
			{
				throw new Error('Table creation: invalid column type ' + type);
			}
			sql += colName + ' ' + sqlType + ', ';
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
		transaction: function(operationsFn, onError, onSuccess)
		{
			this.db.transaction(function(r){
				operationsFn(new Trans(r));
			}, onError, onSuccess);
		},

		readTransaction: function(operationsFn, onError, onSuccess)
		{
			this.db.readTransaction(function(r){
				operationsFn(new Trans(r));
			}, onError, onSuccess);
		}
	};

return {
	// Opens a database. If it does not exist, it would be created
	open: function(name, displayName, createHandler, openHandler, errHandler)
	{
		var db;
		try
		{
			db = openDatabase(name, '', displayName, 1024 * 1024 * 1);
		}
		catch (e)
		{
			errHandler(err);
		}
		// https://code.google.com/p/chromium/issues/detail?id=324593
		var sem = new DB(db);
		// we always set db version to '1'
		if (db.version)
		{
			openHandler(sem);
		}
		else	// if version is not set we consider the database has been just created
		{
			db.changeVersion(db.version, '1', function(tr){
				createHandler(new Trans(tr));
			}, function onErr(err){
				errHandler(err);
			}, function onSucc(){
				openHandler(sem);
			});
		}
	},

// ************************ Version *********************************************************
	driver: {name: '4 chrome', version: 1}
}
});