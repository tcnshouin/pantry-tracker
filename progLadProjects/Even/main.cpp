#include <iostream>
#include <string>


using namespace std;

int main() {
    int numcount;
    cout << "Enter how many numbers you want to input: ";
    cin >> numcount;

    int num;
    int sumeven = 0, sumodd = 0;
    string evennum, oddnum;

    for (int i = 1; i <= numcount; i++) {
        cout << "Enter num" << i << ": ";
        cin >> num;

        if (num % 2 == 0) {
            if (i != numcount) {
                sumeven += num;
                string evenstr = to_string(num);
                evennum += evenstr += ", ";
            }
            else{sumeven += num;
                string evenstr = to_string(num);
                evennum += evenstr;}
        }
        else if(num % 2 != 0) {
            if (i != numcount) {
                sumodd += num;
                string oddstr = to_string(num);
                oddnum += oddstr += ", ";
            }
            else{sumodd += num;
                string oddstr = to_string(num);
                oddnum += oddstr;}
        }

    }
    cout << "Even numbers: " << evennum << endl;
    cout << "Odd numbers: " << oddnum << endl;
    cout << "Sum of even numbers = " << sumeven << endl;
    cout << "Sum of odd numbers  = " << sumodd << endl;
    cout << "Total numbers: " << sumeven + sumodd << endl;

    return 0;
}
