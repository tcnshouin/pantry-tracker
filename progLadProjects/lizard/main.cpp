#include <iostream>

using namespace std;

int main() {
    cout << "Enter length of lizard: ";
    int length, leg; cin >> length;

    leg = length - 2;
    cout << " *";
    for (int i = 1; i <= leg; i++) {
        cout << " ";
    }
    cout << "* "<<endl;
    int body;
    body = length + 2;
    for (int i = 1; i <= body; i++) {
        cout << "*";
    }
    cout<< endl;
    cout << " *";
    for (int i = 1; i <= leg; i++) {
        cout << " ";
    }
    cout << "* "<<endl;

}