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

/* TODO Problems/other
 * Probabilities for breeding/mutation/other maybe required in db
 * 
 */

package io.github.kranex.gaframework;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;

import javax.script.ScriptException;

import io.github.kranex.gaframework.database.DatabaseUtils;
import io.github.kranex.gaframework.engine.Engine;

/**
 * @author Oliver Strik oliverstrik@gmail.com
 * 
 * @version v0.2.0
 * @since v0.1.0
 */
public class GAFramework {

	/* constants for debugging and verbose output. */
	public static boolean VERBOSE = true;
	public static boolean DEBUG = false;

	private static Engine engine;
	/* declaration for the database. */
	public static Connection database;

	/* initialization of the framework script break boolean. */
	public static boolean BREAK = false;

	/* start of the java program. */
	public static void main(String[] args) throws NumberFormatException, ScriptException,
			ClassNotFoundException, SQLException, NoSuchMethodException, IOException {
		
		/* Deal with arguments */
		List<String> arguments = new LinkedList<String>(Arrays.asList(args));
		List<Integer> remove = new ArrayList<Integer>();
		if(!arguments.contains("-q"))printLicense();
		for (int i = 0; i < arguments.size(); i++) {
			switch (arguments.get(i)) {
			case "-w":
				System.out.println(
						"This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.");
				return;
			case "-c":
				System.out.println(
						"This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.");
				return;
			case "-h":
				printHelp();
				return;
			case "-q":
				VERBOSE = false;
				break;
			case "-d":
				DEBUG = true;
				debug("enabled.");
				break;
			default:
				continue;
			}
			debug("removing argument: " + arguments.get(i));
			remove.add(i);
		}
		for(int i : remove){
			arguments.remove(i);
		}
		try {
			/* initialize database. */
			debug("starting database...");
			database = DatabaseUtils.createDatabaseConnection(arguments.get(1));
			/* starts the GASolver program. */
			verbose("Initalising GAFramework...");
			new GAFramework(new File(arguments.get(0)), Integer.parseInt(arguments.get(2)), Integer.parseInt(arguments.get(3)));

			debug("closing database connection...");
			/* shuts down the database. */
			database.close();
		} catch (ArrayIndexOutOfBoundsException e) {
			/* this happens if not enough arguments are given to the program. */
			System.out.println("[ERROR] Not enough arguments. Usage:");
			printHelp();
		}
	}

	/**
	 * Start of the GAFramework Program.
	 * 
	 * @param file
	 *            javascript genetic script.
	 * @param itter
	 *            # of iterations.
	 * @param poolSize
	 *            # of chromosomes in the pool.
	 * @throws ScriptException
	 * @throws SQLException
	 * @throws NoSuchMethodException
	 * @throws IOException 
	 * @since v0.1.0
	 */
	public GAFramework(File file, int itter, int poolSize)
			throws ScriptException, SQLException, NoSuchMethodException, IOException {

		/* calls the javascript initalisation method. */
		engine = new Engine(file);
		
		/*
		 * init method not explicitly required, so try it and ignore if nothing
		 * happens.
		 */
		try {
			engine.inv.invokeFunction("init");
		} catch (NoSuchMethodException e) {
			debug("No init function...");
		}

		/* invoke the initPool function. */
		engine.inv.invokeFunction("initPool", poolSize);
		boolean debugElite = true;
		for (int i = 0; i < itter; i++) {
			if(itter >=20){
				if(i%(itter/20) == 0){
					if(VERBOSE){
							System.out.print("\r" + ((int)((((double)i)/(double)itter)*100.0) + "% "));
					}
				}
			}
			/*
			 * invoke breed and mutate functions, also break if the script calls
			 * for it.
			 * 
			 * the try catches are there because some methods are optional.
			 * 
			 * If a loop method is not found, then do the default order.
			 * 
			 */
			try {
				engine.inv.invokeFunction("loop", i);
			} catch (NoSuchMethodException e) {
				engine.inv.invokeFunction("breed");
				engine.inv.invokeFunction("mutate");
				try {
					engine.inv.invokeFunction("elite");
				} catch (NoSuchMethodException ex) {
					if (debugElite) {
						debug("No elite function...");
						debugElite = false;
					}
				}
			}
			if (BREAK) {
				break;
			}
		}
		/*
		 * invoke the output function to output the final solution or other
		 * stuff as required
		 */
		verbose("\nOutput:");
		engine.inv.invokeFunction("output");
	}

	/**
	 * Debug logger.
	 * 
	 * @param string
	 *            debug message to output.
	 * @since v0.1.0
	 */
	public static void debug(String string) {
		if (DEBUG) {
			System.out.println("[DEBUG] " + string);
		}
	}

	/**
	 * Verbose logger.
	 * 
	 * @param string
	 *            message to output.
	 * @since v0.1.0
	 */
	public static void verbose(String string) {
		if (VERBOSE) {
			System.out.println(string);
		}
	}

	/**
	 * Outputs the Help Text.
	 * 
	 * @since v0.1.0
	 */
	public static void printHelp() {
		printLicense();
		System.out.println("GAFramework <Framework Script> <Database> <Generations> <Chromosomes/Pool>");
	}
	
	/**
	 * @since v0.2.0
	 */
	public static void printLicense(){
		System.out.println("GAFramework  Copyright (C) 2017 Oliver Strik");
		System.out.println("This program comes with ABSOLUTELY NO WARRANTY; for details type `GAFramework -w'.");
		System.out.println(
				"This is free software, and you are welcome to redistribute it under certain conditions; type `GAFramework -c' for details.\n");
	}
	
	public static void testing() throws SQLException{
		Statement statement = database.createStatement();
		ResultSet table = statement.executeQuery("SELECT * FROM CITIES");
		table.absolute(1);
	}
}
