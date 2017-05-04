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
package io.github.kranex.gaframework.data;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import io.github.kranex.gaframework.GAFramework;

/**
 * @author oli
 *
 */
public class Table {
	private String[][] table;
	private List<String> columns, rows;
	
	public Table(File file) throws IOException{
		rows = new ArrayList<String>();
		BufferedReader reader = new BufferedReader(new FileReader(file));
		String line;
		List<String[]> rowz = new ArrayList<String[]>();
		while((line = reader.readLine()) != null){
			if(columns == null){
				columns = new ArrayList<String>(Arrays.asList(line.replaceAll("/t", "").split(" ")));
				columns.removeAll(Arrays.asList("", null));
				continue;
			}
			List<String> row = new ArrayList<String>(Arrays.asList(line.replaceAll("/t", "").split(" ")));
			row.removeAll(Arrays.asList("", null));
			rows.add(row.get(0));
			row.remove(0);
			rowz.add(row.toArray(new String[row.size()]));
		}
		table = new String[rows.size()][];
		for( int i = 0; i < rows.size(); i++){
			table[i] = rowz.get(i);
		}
		reader.close();
	}

	public String getString(int row, int column){
		return table[row][column];
	}
	public float getFloat(int row, int column){
		return Float.parseFloat(getString(row, column));
	}
	public double getDouble(int row, int column){
		return Double.parseDouble(getString(row, column));
		
	}
	/**
	 * @return the table
	 */
	public String[][] getTable() {
		return table;
	}

	/**
	 * @return the columns
	 */
	public List<String> getColumns() {
		return columns;
	}

	/**
	 * @return the rows
	 */
	public List<String> getRows() {
		return rows;
	}
}
