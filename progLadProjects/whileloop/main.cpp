#include <iostream>
using namespace std;

void bord() {
    cout <<"********************************************************************************"<< endl;
}

int add(int a, int b) {
    int sum = a + b;
    return sum;
}
int sub(int a, int b) {
    int sub = a - b;
    return sub;
}
int mult(int a, int b) {
    int prod = a * b;
    return prod;
}
int divide(int a, int b) {
    int div = a / b;
    return div;
}
int modul(int a, int b) {
    int mod = a % b;
    return mod;
}


int main() {
    int i;
    int a, b;
    int sum;
    bord();
    repeat:

    cout << "Choose Option [1]Add, [2]Subtract, [3]Multiply, [4]Divide, [5]Modulus [6]Exit: ";
    cin >> i;



    switch (i) {
        case 1:
            bord();
            cout << "Enter a: ";
            cin >> a;
            cout << "Enter b: ";
            cin >> b;
            sum = add(a,b);
            bord();
            cout << "Sum: " << sum << endl;
            bord();
            goto repeat;
        case 2:
            bord();
            cout << "Enter a: ";
            cin >> a;
            cout << "Enter b: ";
            cin >> b;
            bord();
            cout << "Difference: " << sub(a, b) << endl;
            bord();
            goto repeat;
        case 3:
            bord();
            cout << "Enter a: ";
            cin >> a;
            cout << "Enter b: ";
            cin >> b;
            bord();
            cout << "Product: " << mult(a, b) << endl;
            bord();
            goto repeat;
        case 4:
            bord();
            cout << "Enter a: ";
            cin >> a;
            cout << "Enter b: ";
            cin >> b;
            bord();
            cout << "Quotient" << divide(a, b) << endl;
            bord();
            goto repeat;
        case 5:
            bord();
            cout << "Enter a: ";
            cin >> a;
            cout << "Enter b: ";
            cin >> b;
            bord();
            cout << "Modulus: "<< modul(a, b) << endl;
            bord();
            goto repeat;
        case 6:
            bord();
            cout << "Exiting..." << endl;
            break;
        default:
            cout << "Please Input a valid Option!\nChoose Option [1]Add, [2]Subtract, [3]Multiply, [4]Divide, [5]Modulus: ";
            cin >> i;
    }

    }



