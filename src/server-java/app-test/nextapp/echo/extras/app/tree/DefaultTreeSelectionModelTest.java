/* 
 * This file is part of the Echo Web Application Framework (hereinafter "Echo").
 * Copyright (C) 2002-2009 NextApp, Inc.
 *
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 */

package nextapp.echo.extras.app.tree;

import nextapp.echo.app.event.ChangeEvent;
import nextapp.echo.app.event.ChangeListener;
import junit.framework.TestCase;

public class DefaultTreeSelectionModelTest extends TestCase {

	private DefaultTreeSelectionModel selectionModel;
	private TreePath path1;
	private TreePath path2;

	protected void setUp() throws Exception {
		selectionModel = new DefaultTreeSelectionModel();
		path1 = new TreePath("1");
		path2 = new TreePath("2");
	}
	
	public void testAddSelectionPathReplacesWhenSingleSelection() {
		selectionModel.setSelectionMode(TreeSelectionModel.SINGLE_SELECTION);
		
		selectionModel.addSelectionPath(path1);
		selectionModel.addSelectionPath(path2);
		
		TreePath[] actualPaths = selectionModel.getSelectionPaths();
		assertEquals(1, actualPaths.length);
		assertEquals(path2, actualPaths[0]);
	}
	
	public void testAddSelectionPathsAddsOnlyFirstWhenSingleSelection() {
		selectionModel.setSelectionMode(TreeSelectionModel.SINGLE_SELECTION);
		
		selectionModel.addSelectionPaths(new TreePath[] {path1, path2});
		
		TreePath[] actualPaths = selectionModel.getSelectionPaths();
		assertEquals(1, actualPaths.length);
		assertEquals(path1, actualPaths[0]);
	}
	
	public void testSetSelectionPathsSetsOnlyFirstWhenSingleSelection() {
		selectionModel.setSelectionMode(TreeSelectionModel.SINGLE_SELECTION);
		
		selectionModel.setSelectionPaths(new TreePath[] {path1, path2});
		
		TreePath[] actualPaths = selectionModel.getSelectionPaths();
		assertEquals(1, actualPaths.length);
		assertEquals(path1, actualPaths[0]);
	}
	
	public void testAddSameSelectionPathTwice() {
		selectionModel.setSelectionMode(TreeSelectionModel.MULTIPLE_SELECTION);

		selectionModel.addSelectionPath(path1);
		selectionModel.addSelectionPath(path1);
		
		assertEquals(1, selectionModel.getSelectionPaths().length);
	}
	
	public void testIsPathSelected() {
		selectionModel.setSelectionMode(TreeSelectionModel.MULTIPLE_SELECTION);
		
		selectionModel.setSelectionPath(path2);
		
		assertFalse(selectionModel.isPathSelected(path1));
		assertTrue(selectionModel.isPathSelected(path2));
	}
	
	public void testRemoveSelectionPath() {
		selectionModel.setSelectionMode(TreeSelectionModel.MULTIPLE_SELECTION);
		
		selectionModel.setSelectionPaths(new TreePath[] {path1, path2});
		selectionModel.removeSelectionPath(path2);
		
		assertTrue(selectionModel.isPathSelected(path1));
		assertFalse(selectionModel.isPathSelected(path2));
	}
	
	public void testAddMultiplePathsWhenMultipleSelection() {
		selectionModel.setSelectionMode(TreeSelectionModel.MULTIPLE_SELECTION);
		
		selectionModel.addSelectionPaths(new TreePath[] {path1, path2});
		
		assertEquals(2, selectionModel.getSelectionPaths().length);
		assertTrue(selectionModel.isPathSelected(path1));
		assertTrue(selectionModel.isPathSelected(path2));
	}
	
	public void testSetMultiplePathsWhenMultipleSelection() {
		selectionModel.setSelectionMode(TreeSelectionModel.MULTIPLE_SELECTION);
		
		TreePath path3 = new TreePath("3");
		
		selectionModel.setSelectionPath(path3);
		selectionModel.setSelectionPaths(new TreePath[] {path1, path2});
		
		assertEquals(2, selectionModel.getSelectionPaths().length);
		assertTrue(selectionModel.isPathSelected(path1));
		assertTrue(selectionModel.isPathSelected(path2));
	}
	
	public void testClearSelection() {
		selectionModel.setSelectionMode(TreeSelectionModel.MULTIPLE_SELECTION);
		
		selectionModel.addSelectionPaths(new TreePath[] {path1, path2});
		selectionModel.clearSelection();
		
		assertEquals(0, selectionModel.getSelectionPaths().length);
		assertTrue(selectionModel.isSelectionEmpty());
	}
	
	public void testAddSameSelectionPathFiresOnce() {
		Listener listener = new Listener();
		selectionModel.addChangeListener(listener);

		selectionModel.addSelectionPath(path1);
		assertEquals(1, listener.getInvocationCount());
		selectionModel.addSelectionPath(path1);
		assertEquals(1, listener.getInvocationCount());
	}
	
	public void testSetSelectionPathFiresListener() {
		Listener listener = new Listener();
		selectionModel.addChangeListener(listener);
		
		selectionModel.setSelectionPath(path1);
		assertEquals(1, listener.getInvocationCount());
	}
	
	public void testAddSelectionPathFiresListener() {
		Listener listener = new Listener();
		selectionModel.addChangeListener(listener);
		
		selectionModel.addSelectionPath(path1);
		assertEquals(1, listener.getInvocationCount());
		selectionModel.addSelectionPath(path2);
		assertEquals(2, listener.getInvocationCount());
	}
	
	public void testAddSelectionPathFiresListenerWhenMultipleSelection() {
		selectionModel.setSelectionMode(TreeSelectionModel.MULTIPLE_SELECTION);
		Listener listener = new Listener();
		selectionModel.addChangeListener(listener);
		
		selectionModel.addSelectionPath(path1);
		assertEquals(1, listener.getInvocationCount());
		selectionModel.addSelectionPath(path2);
		assertEquals(2, listener.getInvocationCount());
	}
	
	public void testAddMultipleSelectionPathsFiresOnce() {
		selectionModel.setSelectionMode(TreeSelectionModel.MULTIPLE_SELECTION);
		Listener listener = new Listener();
		selectionModel.addChangeListener(listener);
		
		selectionModel.addSelectionPaths(new TreePath[] {path1, path2});
		assertEquals(1, listener.getInvocationCount());
	}
	
	public void testSetMultipleSelectionPathsFiresOnce() {
		selectionModel.setSelectionMode(TreeSelectionModel.MULTIPLE_SELECTION);
		Listener listener = new Listener();
		selectionModel.addChangeListener(listener);
		
		selectionModel.setSelectionPaths(new TreePath[] {path1, path2});
		assertEquals(1, listener.getInvocationCount());
	}
	
	public void testRemoveSelectionPathFiresListener() {
		Listener listener = new Listener();
		selectionModel.addChangeListener(listener);
		
		selectionModel.addSelectionPath(path1);
		assertEquals(1, listener.getInvocationCount());
		selectionModel.removeSelectionPath(path1);
		assertEquals(2, listener.getInvocationCount());
	}
	
	public void testClearSelectionFiresListener() {
		Listener listener = new Listener();
		selectionModel.addChangeListener(listener);
		
		selectionModel.addSelectionPath(path1);
		assertEquals(1, listener.getInvocationCount());
		selectionModel.clearSelection();
		assertEquals(2, listener.getInvocationCount());
	}
	
	private static class Listener implements ChangeListener {
		private int count = 0;
		
		public void stateChanged(ChangeEvent e) {
			count++;
		}
		
		public int getInvocationCount() {
			return count;
		}
		
		public boolean isInvoked() {
			return count != 0;
		}
	}
	
}
