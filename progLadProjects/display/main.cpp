#include <iostream>

using namespace std;
int main() {
    cout << "Enter num1: ";
    int num1; cin >> num1;

    cout << "Enter float value for fnum: ";
    float fnum; cin >> fnum;

    cout << "Enter a character: ";
    char letter; cin >> letter;

    cout << "Enter a double type of number: ";
    double dnum; cin >> dnum;

    cout << "Enter a message: ";
    string message; cin >> message;

    cout << num1 << endl;
    cout << fnum << endl;
    cout << letter << endl;
    cout << dnum << endl;
    cout << message << endl;

    return 0;
}