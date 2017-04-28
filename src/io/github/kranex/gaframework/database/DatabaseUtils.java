/*
 *  A Framework for writing Genetic Algorithms in Javascript using data stored in a Derby database.
 *  Copyright (C) 1997 Oliver Strik
 *	
 *  This file is part of GAFramework
 *
 *  GAFramework is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  GAFramework is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with GAFramework.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * 
 */
package io.github.kranex.gaframework.database;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * @author oli
 *
 */
public class DatabaseUtils {

	/**
	 * Creates a database connection object. Loads the embedded driver, starts
	 * and connects to database using the connection URL Generated via the given
	 * database folder.
	 * 
	 * @param db
	 *            the database folder
	 * @return
	 * @throws SQLException
	 * @throws ClassNotFoundException
	 * @since v0.1.0
	 */
	public static Connection createDatabaseConnection(String db) throws SQLException, ClassNotFoundException {
		String driver = "org.apache.derby.jdbc.EmbeddedDriver";
		Class.forName(driver);
		String url = "jdbc:derby:" + db;
		return DriverManager.getConnection(url);
	}
}
