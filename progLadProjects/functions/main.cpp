#include <iostream>
using namespace std;

	void add();
	void sub();
	void mul();
	void div();

int main () {
	int choose;

	cout << "1 - Add" << endl;
	cout << "2 - Subtract" << endl;
	cout << "3 - Multiply" << endl;
	cout << "4 - Divide" << endl;

	cout << "Select an operation: ";
	cin >> choose;

	if (choose == 1) {
		add();
	} else if (choose == 2){
		sub();
	} else if (choose == 3){
		mul();
 	} else if (choose == 4){
 		div();
	} else {
		cout << "Invalid choice.";
	}

return 0;
}

void add(){
	int a, b;
	cout << "Enter two numbers: ";
	cin >> a >> b;
	cout << "Sum: " << a + b;
}
void sub(){
	int a, b;
	cout << "Enter two numbers: ";
	cin >> a >> b;
	cout << "Difference: " << a - b;
}
void mul(){
	int a, b;
	cout << "Enter two numbers: ";
	cin >> a >> b;
	cout << "Product: " << a * b;
}

void div(){
	int a, b;
	cout << "Enter two numbers: ";
	cin >> a >> b;

		if (b!=0){
			cout << "Quotient: " << a / b;
		} else {
			cout << "Cannot divide by zero.";
		}
}